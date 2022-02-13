import EditIcon from "@mui/icons-material/Edit";
import { Box, IconButton, Skeleton, Theme, Typography } from "@mui/material";
import makeStyles from "@mui/styles/makeStyles";
import clsx from "clsx";
import * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useDropzone } from "react-dropzone";
import isEqual from "react-fast-compare";
import { useSnackbarController, useStorageSource } from "../../../../../hooks";
import {
    ArrayProperty,
    EntityValues,
    Property,
    StorageMeta,
    StringProperty
} from "../../../../../models";
import { PreviewComponent, PreviewSize } from "../../../../../preview";
import { getThumbnailMeasure } from "../../../../../preview/util";
import { ErrorBoundary } from "../../../../internal/ErrorBoundary";





export const useStyles = makeStyles<Theme, { hasValue: boolean }>((theme: Theme) => ({
    dropZone: {
        position: "relative",
        height: "100%",
        outline: 0,
        display: "flex",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: ({ hasValue }) => hasValue ? "start" : "center",
        alignItems: "center"
    },
    activeDrop: {
        borderRadius: "2px",
        border: "2px solid",
        borderColor: "transparent"
    },
    acceptDrop: {
        transition: "background-color 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms",
        background: "repeating-linear-gradient( 45deg, rgba(128, 128, 128, 0.2), rgba(128, 128, 128, 0.2) 10px, rgba(128, 128, 128, 0.25) 10px, rgba(128, 128, 128, 0.25) 20px) !important",
        // background: "repeating-linear-gradient( 45deg, rgba(0, 0, 0, 0.09), rgba(0, 0, 0, 0.09) 10px, rgba(0, 0, 0, 0.12) 10px, rgba(0, 0, 0, 0.12) 20px) !important",
        borderColor: theme.palette.success.light
    },
    rejectDrop: {
        borderColor: theme.palette.error.light
    },
    arrayEntry: {
        border: "1px dashed transparent",
        borderRadius: "4px"
    },
    arrayEntryHovered: {
        opacity: 0.5,
        border: "1px dashed gray",
        boxSizing: "border-box"
    },
    thumbnailCloseIcon: {
        position: "absolute",
        borderRadius: "9999px",
        top: -8,
        right: -8,
        zIndex: 100,
        backgroundColor: theme.palette.background.paper
    }
}));


/**
 * Field that allows to upload files to Google Cloud Storage.
 *
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TableStorageUpload(props: {
    name: string;
    error: Error | undefined;
    disabled: boolean;
    internalValue: string | string[] | null;
    updateValue: (newValue: (string | string[] | null)) => void;
    focused: boolean;
    property: StringProperty | ArrayProperty<string[]>;
    entityId: string;
    previewSize: PreviewSize;
    entityValues: EntityValues<any>;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        name,
        error,
        internalValue,
        disabled,
        property,
        entityId,
        entityValues,
        previewSize,
        updateValue,
        setPreventOutsideClick
    } = props;

    const multipleFilesSupported = property.dataType === "array";

    const storageMeta: StorageMeta | undefined = property.dataType === "string"
        ? property.config?.storageMeta
        : property.dataType === "array" &&
            (property.of as Property).dataType === "string"
            ? (property.of as StringProperty).config?.storageMeta
            : undefined;

    if (!storageMeta)
        throw Error("Storage meta must be specified");

    const fileNameBuilder = (file: File) => {
        if (storageMeta.fileName) {
            const fileName = storageMeta.fileName({
                entityId,
                values: entityValues,
                property,
                file,
                storageMeta,
                name
            });

            if (!fileName || fileName.length === 0) {
                throw Error("You need to return a valid filename");
            }
            return fileName;
        }
        return file.name;
    };

    const storagePathBuilder = (file: File) => {
        if (typeof storageMeta.storagePath === "string")
            return storageMeta.storagePath;

        if (typeof storageMeta.storagePath === "function") {
            const storagePath = storageMeta.storagePath({
                entityId: entityId,
                values: entityValues,
                property,
                file,
                storageMeta,
                name
            });

            if (!storagePath || storagePath.length === 0) {
                throw Error("You need to return a valid filename");
            }
            return storagePath;
        }
        console.warn("When using a storage property, if you don't specify the storagePath, the root storage is used");
        return "/";
    };


    return (

        <StorageUpload
            value={internalValue}
            name={name}
            disabled={disabled}
            autoFocus={false}
            property={property}
            onChange={(newValue) => {
                updateValue(
                    newValue
                );
            }}
            fileNameBuilder={fileNameBuilder}
            storagePathBuilder={storagePathBuilder}
            storageMeta={storageMeta}
            multipleFilesSupported={multipleFilesSupported}
            previewSize={previewSize} />

    );
}

/**
 * Internal representation of an item in the storage
 * It can have two states, having a storagePathOrDownloadUrl set,
 * which means the file has
 * been uploaded and it is rendered as a preview
 * Or have a pending file being uploaded.
 */
interface StorageFieldItem {
    id: number; // generated on the fly for internal use only
    storagePathOrDownloadUrl?: string;
    file?: File;
    fileName?: string;
    metadata?: any
}

interface StorageUploadProps {
    value: string | string[] | null;
    name: string;
    property: StringProperty | ArrayProperty<string[]>;
    onChange: (value: string | string[] | null) => void;
    multipleFilesSupported: boolean;
    autoFocus: boolean;
    disabled: boolean;
    previewSize: PreviewSize;
    storageMeta: StorageMeta;
    fileNameBuilder: (file: File) => string;
    storagePathBuilder: (file: File) => string;
}

function StorageUpload({
    property,
    name,
    value,
    onChange,
    multipleFilesSupported,
    previewSize: previewSizeInput,
    disabled,
    autoFocus,
    storageMeta,
    fileNameBuilder,
    storagePathBuilder
}: StorageUploadProps) {

    const storage = useStorageSource();
    const [onHover, setOnHover] = useState(false);

    const previewSize = multipleFilesSupported && previewSizeInput === "regular" ? "small" : previewSizeInput;
    if (multipleFilesSupported) {
        const arrayProperty = property as ArrayProperty<string[]>;
        if (arrayProperty.of) {
            if (arrayProperty.of.dataType !== "string") {
                throw Error("Storage field using array must be of data type string");
            }
        } else {
            throw Error("Storage field using array must be of data type string");
        }
    }

    const metadata: any | undefined = storageMeta?.metadata;
    const hasValue = Boolean(value);

    const classes = useStyles({ hasValue });

    const internalInitialValue: StorageFieldItem[] =
        value == null
            ? []
            : (multipleFilesSupported
                ? value as string[]
                : [value as string]).map(entry => (
                    {
                        id: getRandomId(),
                        storagePathOrDownloadUrl: entry,
                        metadata: metadata,
                        size: previewSize
                    }
                ));

    const initialValue = React.useRef<string | string[] | null>(value);
    const [internalValue, setInternalValue] = React.useState<StorageFieldItem[]>(internalInitialValue);

    if (!isEqual(initialValue.current, value)) {
        initialValue.current = value;
        setInternalValue(internalInitialValue ?? []);
    }

    function getRandomId() {
        return Math.floor(Math.random() * Math.floor(Number.MAX_SAFE_INTEGER));
    }

    function removeDuplicates(items: StorageFieldItem[]) {
        return items.filter(
            (v, i) => {
                return ((items.map((v) => v.storagePathOrDownloadUrl).indexOf(v.storagePathOrDownloadUrl) === i) || !v.storagePathOrDownloadUrl) &&
                    ((items.map((v) => v.file).indexOf(v.file) === i) || !v.file);
            }
        );
    }

    const onExternalDrop = (acceptedFiles: File[]) => {

        if (!acceptedFiles.length || disabled)
            return;

        let newInternalValue: StorageFieldItem[];
        if (multipleFilesSupported) {
            newInternalValue = [...internalValue,
            ...(acceptedFiles.map(file => ({
                id: getRandomId(),
                file,
                fileName: fileNameBuilder(file),
                metadata
            } as StorageFieldItem)))];
        } else {
            newInternalValue = [{
                id: getRandomId(),
                file: acceptedFiles[0],
                fileName: fileNameBuilder(acceptedFiles[0]),
                metadata
            }];
        }

        // Remove either storage path or file duplicates
        newInternalValue = removeDuplicates(newInternalValue);
        setInternalValue(newInternalValue);
    };

    const onFileUploadComplete = async (uploadedPath: string,
        entry: StorageFieldItem,
        metadata?: any) => {

        let uploadPathOrDownloadUrl = uploadedPath;
        if (storageMeta.storeUrl) {
            uploadPathOrDownloadUrl = await storage.getDownloadURL(uploadedPath);
        }
        if (storageMeta.postProcess) {
            uploadPathOrDownloadUrl = await storageMeta.postProcess(uploadPathOrDownloadUrl);
        }

        let newValue: StorageFieldItem[];

        entry.storagePathOrDownloadUrl = uploadPathOrDownloadUrl;
        entry.metadata = metadata;
        newValue = [...internalValue];

        newValue = removeDuplicates(newValue);
        setInternalValue(newValue);

        const fieldValue = newValue
            .filter(e => !!e.storagePathOrDownloadUrl)
            .map(e => e.storagePathOrDownloadUrl as string);

        if (multipleFilesSupported) {
            onChange(fieldValue);
        } else {
            onChange(fieldValue ? fieldValue[0] : null);
        }
    };

    const onClear = (clearedStoragePathOrDownloadUrl: string) => {
        if (multipleFilesSupported) {
            const newValue: StorageFieldItem[] = internalValue.filter(v => v.storagePathOrDownloadUrl !== clearedStoragePathOrDownloadUrl);
            onChange(newValue.filter(v => !!v.storagePathOrDownloadUrl).map(v => v.storagePathOrDownloadUrl as string));
            setInternalValue(newValue);
        } else {
            onChange(null);
            setInternalValue([]);
        }
    };

    const {
        open,
        getRootProps,
        getInputProps,
        isDragActive,
        isDragAccept,
        isDragReject
    } = useDropzone({
        accept: storageMeta.acceptedFiles,
        disabled: disabled,
        noClick: true,
        noKeyboard: true,
        onDrop: onExternalDrop
    }
    );

    const { ...rootProps } = getRootProps();

    const helpText = multipleFilesSupported
        ? "Arraste ou clique aqui para editar"
        : "Arraste ou clique aqui para editar";

    const renderProperty = multipleFilesSupported
        ? (property as ArrayProperty<string[]>).of as StringProperty
        : property as StringProperty;

    return (
        <Box {...rootProps}

            onMouseEnter={() => setOnHover(true)}
            onMouseMove={() => setOnHover(true)}
            onMouseLeave={() => setOnHover(false)}
            className={clsx(classes.dropZone, {
                [classes.activeDrop]: isDragActive,
                [classes.rejectDrop]: isDragReject,
                [classes.acceptDrop]: isDragAccept
            })}
        >

            <input autoFocus={autoFocus} {...getInputProps()} />

            {internalValue.map((entry, index) => {
                let child;
                if (entry.storagePathOrDownloadUrl) {
                    child = (
                        <StorageItemPreview
                            key={`storage_preview_${index}`}
                            property={renderProperty}
                            disabled={disabled}
                            value={entry.storagePathOrDownloadUrl}
                            onClear={onClear}
                            size={previewSize} />
                    );
                } else if (entry.file) {
                    child = (
                        <StorageUploadProgress
                            key={`storage_progress_${index}`}
                            entry={entry}
                            metadata={metadata}
                            storagePath={storagePathBuilder(entry.file)}
                            onFileUploadComplete={onFileUploadComplete}
                            size={previewSize}
                        />
                    );
                }

                return child;
            })
            }

            {!value && <Box
                sx={{
                    flexGrow: 1,
                    m: 2,
                    maxWidth: 200
                }}
                onClick={open}>
                <Typography
                    sx={{
                        color: (theme) => (theme.palette.mode === "light" ? "#999" : "#444")
                    }}
                    variant={"body2"}
                    align={"center"}>
                    {helpText}
                </Typography>
            </Box>}

            {onHover &&
                <IconButton
                    color={"inherit"}
                    size={"small"}
                    onClick={open}
                    sx={{
                        position: "absolute",
                        bottom: 2,
                        right: 2
                    }}>
                    <EditIcon sx={{
                        width: 16,
                        height: 16,
                        fill: "#666"
                    }
                    } />
                </IconButton>
            }


        </Box>
    );

}


interface StorageUploadItemProps {
    storagePath: string;
    metadata?: any,
    entry: StorageFieldItem,
    onFileUploadComplete: (value: string,
        entry: StorageFieldItem,
        metadata?: any) => Promise<void>;
    size: PreviewSize;
}

export function StorageUploadProgress({
    storagePath,
    entry,
    metadata,
    onFileUploadComplete,
    size
}: StorageUploadItemProps) {

    const storage = useStorageSource();

    const snackbarContext = useSnackbarController();

    const [error, setError] = React.useState<string>();
    const [loading, setLoading] = React.useState<boolean>(false);
    const mounted = React.useRef(false);

    const upload = useCallback((file: File, fileName?: string) => {

        setError(undefined);
        setLoading(true);

        storage.uploadFile({ file, fileName, path: storagePath, metadata })
            .then(async ({ path }) => {
                await onFileUploadComplete(path, entry, metadata);
                if (mounted.current)
                    setLoading(false);
            })
            .catch((e) => {
                console.error("Upload error", e);
                if (mounted.current) {
                    setError(e.message);
                    setLoading(false);
                }
                snackbarContext.open({
                    type: "error",
                    title: "Erro ao efetuar upload",
                    message: e.message
                });
            });
    }, [entry, metadata, onFileUploadComplete, snackbarContext, storage, storagePath]);

    useEffect(() => {
        mounted.current = true;
        if (entry.file)
            upload(entry.file, entry.fileName);
        return () => {
            mounted.current = false;
        };
    }, [entry.file, entry.fileName, upload]);

    const imageSize = useMemo(() => getThumbnailMeasure(size), [size]);

    return (

        <Box m={1} sx={{
            width: imageSize,
            height: imageSize
        }}>

            {loading && <Skeleton variant="rectangular" sx={{
                width: imageSize,
                height: imageSize
            }} />}

            {error && <p>Erro ao efetuar upload: {error}</p>}

        </Box>

    );

}

interface StorageItemPreviewProps {
    property: StringProperty;
    value: string,
    onClear: (value: string) => void;
    size: PreviewSize;
    disabled: boolean;
}

export function StorageItemPreview({
    property,
    value,
    size
}: StorageItemPreviewProps) {

    return (
        <Box
            m={1}
            position={"relative"}
        >

            {value &&
                <ErrorBoundary>
                    <PreviewComponent value={value}
                        property={property}
                        size={size} />
                </ErrorBoundary>
            }
        </Box>
    );

}

import React, { useCallback, useEffect, useState } from "react";
import isEqual from "react-fast-compare";
import { AnySchema } from "yup";
import { useClearRestoreValue } from "../../../../hooks";
import {
    ArrayProperty,
    CMSType,
    EntityReference,
    EntityValues,
    NumberProperty,
    Property,
    ReferenceProperty,
    StringProperty,
    TimestampProperty
} from "../../../../models";
import { PreviewComponent } from "../../../../preview";
import { getPreviewSizeFrom } from "../../../../preview/util";
import { ErrorBoundary } from "../../../internal/ErrorBoundary";
import { isReadOnly } from "../../../utils";
import { CellStyleProps } from "../../Table/styles";
import { TableCell } from "../../Table/TableCell";
import { TableDateField } from "./fields/TableDateField";
import { TableInput } from "./fields/TableInput";
import { NumberTableInput } from "./fields/TableNumberInput";
import { TableReferenceField } from "./fields/TableReferenceField";
import { TableSelect } from "./fields/TableSelect";
import { TableStorageUpload } from "./fields/TableStorageUpload";
import { TableSwitch } from "./fields/TableSwitch";



export interface PropertyTableCellProps<T extends CMSType> {
    name: string;
    selected: boolean;
    value: T;
    select: (cellRect: DOMRect | undefined) => void;
    openPopup: (cellRect: DOMRect | undefined) => void;
    setPreventOutsideClick: (value: boolean) => void;
    focused: boolean;
    setFocused: (value: boolean) => void;
    property: Property<T>;
    height: number;
    width: number;
    entityId: string;
    entityValues: EntityValues<any>;
    validation: AnySchema;
    onValueChange?: (params: OnCellChangeParams<T>) => void
}

/**
 * Props passed in a callback when the content of a cell in a table has been edited
 */
export interface OnCellChangeParams<T> {
    value: T,
    name: string,
    setError: (e: Error) => void,
    setSaved: (saved: boolean) => void
}

const PropertyTableCellInternal = <T extends CMSType>({
    selected,
    focused,
    name,
    setPreventOutsideClick,
    setFocused,
    onValueChange,
    select,
    openPopup,
    value,
    property,
    validation,
    size,
    align,
    width,
    height,
    entityId,
    entityValues
}: PropertyTableCellProps<T> & CellStyleProps) => {

    const [internalValue, setInternalValue] = useState<any | null>(value);

    useClearRestoreValue<T>({
        property,
        value: internalValue,
        setValue: setInternalValue
    });

    const [error, setError] = useState<Error | undefined>();
    const [saved, setSaved] = useState<boolean>(false);

    const customField = Boolean(property.config?.Field);
    const customPreview = Boolean(property.config?.Preview);
    const readOnly = isReadOnly(property);
    const disabledTooltip: string | undefined = typeof property.disabled === "object" ? property.disabled.disabledMessage : undefined;
    const disabled = Boolean(property.disabled);

    const onBlur = useCallback(() => {
        setFocused(false);
    }, []);

    useEffect(
        () => {
            if (value !== internalValue) {
                setInternalValue(value);
            }
        },
        [value]
    );

    useEffect(
        () => {
            if (!isEqual(value, internalValue)) {
                setSaved(false);
                validation
                    .validate(internalValue)
                    .then(() => {
                        setError(undefined);
                        if (onValueChange) {
                            onValueChange({
                                value: internalValue,
                                name,
                                setError,
                                setSaved
                            });
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        setError(e);
                    });
            }
        },
        [internalValue]
    );

    const updateValue = useCallback(
        (newValue: any | null) => {

            let updatedValue: any;
            if (newValue === undefined) {
                updatedValue = null;
            } else {
                updatedValue = newValue;
            }
            setInternalValue(updatedValue);
        },
        []
    );

    let innerComponent: JSX.Element | undefined;
    let allowScroll = false;
    let showExpandIcon = false;
    let removePadding = false;
    let fullHeight = false;

    if (!readOnly && !customField && (!customPreview || selected)) {
        const isAStorageProperty = (property.dataType === "string" && (property as StringProperty).config?.storageMeta) ||
            (property.dataType === "array" && (property as ArrayProperty).of?.dataType === "string" && ((property as ArrayProperty).of as StringProperty)?.config?.storageMeta);
        if (isAStorageProperty) {
            innerComponent = <TableStorageUpload error={error}
                disabled={disabled}
                focused={focused}
                property={property as StringProperty | ArrayProperty<string[]>}
                entityId={entityId}
                entityValues={entityValues}
                internalValue={internalValue}
                previewSize={getPreviewSizeFrom(size)}
                updateValue={updateValue}
                name={name as string}
                onBlur={onBlur}
                setPreventOutsideClick={setPreventOutsideClick}
            />;
            showExpandIcon = true;
            fullHeight = true;
            removePadding = true;
        } else if (selected && property.dataType === "number") {
            const numberProperty = property as NumberProperty;
            if (numberProperty.config?.enumValues) {
                innerComponent = <TableSelect name={name as string}
                    multiple={false}
                    disabled={disabled}
                    focused={focused}
                    valueType={"number"}
                    small={getPreviewSizeFrom(size) !== "regular"}
                    enumValues={numberProperty.config.enumValues}
                    error={error}
                    onBlur={onBlur}
                    internalValue={internalValue as string | number}
                    updateValue={updateValue}
                    setPreventOutsideClick={setPreventOutsideClick}
                />;
            } else {
                innerComponent = <NumberTableInput
                    align={align}
                    error={error}
                    focused={focused}
                    disabled={disabled}
                    onBlur={onBlur}
                    value={internalValue as number}
                    updateValue={updateValue}
                />;
                allowScroll = true;
            }
        } else if (selected && property.dataType === "string") {
            const stringProperty = property as StringProperty;
            if (stringProperty.config?.enumValues) {
                innerComponent = <TableSelect name={name as string}
                    multiple={false}
                    focused={focused}
                    disabled={disabled}
                    valueType={"string"}
                    small={getPreviewSizeFrom(size) !== "regular"}
                    enumValues={stringProperty.config.enumValues}
                    error={error}
                    onBlur={onBlur}
                    internalValue={internalValue as string | number}
                    updateValue={updateValue}
                    setPreventOutsideClick={setPreventOutsideClick}
                />;
            } else if (!stringProperty.config?.storageMeta && !stringProperty.config?.markdown) {
                const multiline = !!stringProperty.config?.multiline;
                innerComponent = <TableInput error={error}
                    disabled={disabled}
                    multiline={multiline}
                    focused={focused}
                    value={internalValue as string}
                    updateValue={updateValue}
                />;
                allowScroll = true;
            }
        } else if (property.dataType === "boolean") {
            innerComponent = <TableSwitch error={error}
                disabled={disabled}
                focused={focused}
                internalValue={internalValue as boolean}
                updateValue={updateValue}
            />;
        } else if (property.dataType === "timestamp") {
            innerComponent = <TableDateField name={name as string}
                error={error}
                disabled={disabled}
                focused={focused}
                internalValue={internalValue as Date}
                updateValue={updateValue}
                property={property as TimestampProperty}
                setPreventOutsideClick={setPreventOutsideClick}
            />;
            allowScroll = true;
        } else if (property.dataType === "reference") {
            if (typeof property.path === "string") {
                innerComponent = <TableReferenceField name={name as string}
                    internalValue={internalValue as EntityReference}
                    updateValue={updateValue}
                    disabled={disabled}
                    size={size}
                    property={property as ReferenceProperty}
                    setPreventOutsideClick={setPreventOutsideClick}
                />;
            }
            allowScroll = true;
        } else if (property.dataType === "array") {
            const arrayProperty = (property as ArrayProperty);
            if (arrayProperty.of) {
                if (arrayProperty.of.dataType === "string" || arrayProperty.of.dataType === "number") {
                    if (selected && arrayProperty.of.config?.enumValues) {
                        innerComponent = <TableSelect name={name as string}
                            multiple={true}
                            disabled={disabled}
                            focused={focused}
                            small={getPreviewSizeFrom(size) !== "regular"}
                            valueType={arrayProperty.of.dataType}
                            enumValues={arrayProperty.of.config.enumValues}
                            error={error}
                            onBlur={onBlur}
                            internalValue={internalValue as string | number}
                            updateValue={updateValue}
                            setPreventOutsideClick={setPreventOutsideClick}
                        />;
                        allowScroll = true;
                    }
                } else if (arrayProperty.of.dataType === "reference") {
                    if (typeof arrayProperty.of.path === "string") {
                        innerComponent =
                            <TableReferenceField name={name as string}
                                disabled={disabled}
                                internalValue={internalValue as EntityReference[]}
                                updateValue={updateValue}
                                size={size}
                                property={property as ArrayProperty}
                                setPreventOutsideClick={setPreventOutsideClick}
                            />;
                    }
                    allowScroll = false;
                }
            }

            if (!arrayProperty.of && !arrayProperty.oneOf) {
                throw Error(`You need to specify an 'of' or 'oneOf' prop (or specify a custom field) in your array property ${name}`);
            }
        }
    }

    if (!innerComponent) {
        allowScroll = false;
        showExpandIcon = selected && !innerComponent && !disabled && !readOnly;
        innerComponent = (
            <ErrorBoundary>
                <PreviewComponent
                    width={width}
                    height={height}
                    name={name as string}
                    value={internalValue}
                    property={property}
                    size={getPreviewSizeFrom(size)}
                />
            </ErrorBoundary>
        );
    }

    return (
        <TableCell
            select={select}
            selected={selected}
            focused={focused}
            disabled={disabled || readOnly}
            disabledTooltip={disabledTooltip ?? "Disabled"}
            removePadding={removePadding}
            fullHeight={fullHeight}
            size={size}
            saved={saved}
            error={error}
            align={align}
            allowScroll={allowScroll}
            showExpandIcon={showExpandIcon}
            openPopup={!disabled ? openPopup : undefined}
            value={internalValue}
        >

            {innerComponent}

        </TableCell>
    );

};

export const PropertyTableCell = React.memo<PropertyTableCellProps<any> & CellStyleProps>(PropertyTableCellInternal, areEqual) as React.FunctionComponent<PropertyTableCellProps<any> & CellStyleProps>;

function areEqual(prevProps: PropertyTableCellProps<any> & CellStyleProps, nextProps: PropertyTableCellProps<any> & CellStyleProps) {
    return prevProps.selected === nextProps.selected &&
        prevProps.focused === nextProps.selected &&
        prevProps.height === nextProps.height &&
        prevProps.size === nextProps.size &&
        prevProps.align === nextProps.align &&
        prevProps.width === nextProps.width &&
        isEqual(prevProps.property, nextProps.property) &&
        isEqual(prevProps.value, nextProps.value)
        ;
}


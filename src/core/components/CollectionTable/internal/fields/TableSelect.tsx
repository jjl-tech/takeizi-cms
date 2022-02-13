import { Checkbox, ListItemText, MenuItem, Select, Theme } from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React, { useEffect, useState } from "react";
import { EnumValues } from "../../../../../models";
import { ArrayEnumPreview } from "../../../../../preview";
import { EnumValuesChip } from "../../../../../preview/components/CustomChip";
import {
    enumToObjectEntries,
    isEnumValueDisabled
} from "../../../../util/enums";



export const useInputStyles = makeStyles<Theme>(theme => createStyles({
    select: {
        height: "100%"
    },
    selectRoot: {
        display: "flex",
        alignItems: "center",
        height: "100%"
    }
})
);

export function TableSelect(props: {
    name: string;
    enumValues: EnumValues;
    error: Error | undefined;
    multiple: boolean;
    disabled: boolean;
    small: boolean;
    internalValue: string | number | string[] | number[] | undefined;
    valueType: "string" | "number";
    updateValue: (newValue: (string | number | string[] | number[] | null)) => void;
    focused: boolean;
    onBlur?: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement>;
    setPreventOutsideClick: (value: any) => void;
}) {

    const {
        name,
        enumValues,
        error,
        internalValue,
        disabled,
        small,
        focused,
        updateValue,
        multiple,
        setPreventOutsideClick,
        valueType
    } = props;

    const [open, setOpen] = useState<boolean>(false);
    const handleOpen = () => {
        setPreventOutsideClick(true);
        setOpen(true);
    };

    const handleClose = () => {
        setPreventOutsideClick(false);
        setOpen(false);
    };

    const classes = useInputStyles();

    const validValue = (Array.isArray(internalValue) && multiple) ||
        (!Array.isArray(internalValue) && !multiple);

    const ref = React.createRef<HTMLInputElement>();
    useEffect(() => {
        if (ref.current && focused) {
            ref.current?.focus({ preventScroll: true });
        }
    }, [focused, ref]);

    return (
        <Select
            variant={"standard"}
            key={`table_select_${name}`}
            inputRef={ref}
            className={classes.select}
            classes={{ select: classes.selectRoot }}
            open={open}
            disabled={disabled}
            multiple={multiple}
            onClose={handleClose}
            onOpen={handleOpen}
            fullWidth
            inputProps={{
                style: {
                    height: "100%"
                }
            }}
            disableUnderline
            error={!!error}
            value={validValue
                ? (multiple ? (internalValue as any[]).map(v => v.toString()) : internalValue)
                : (multiple ? [] : "")}
            onChange={(evt) => {
                if (valueType === "number") {
                    if (multiple) {
                        const newValue = (evt.target.value as string[]).map((v) => parseFloat(v));
                        updateValue(newValue);
                    } else {
                        updateValue(parseFloat(evt.target.value as string));
                    }
                } else if (valueType === "string") {
                    if (!evt.target.value)
                        updateValue(null)
                    else
                        updateValue(evt.target.value);
                } else {
                    throw Error("Missing mapping in TableSelect");
                }
            }}
            renderValue={(enumKey: any) => {
                if (multiple && Array.isArray(enumKey)) {
                    return <ArrayEnumPreview value={enumKey}
                        name={name}
                        enumValues={enumValues}
                        size={small ? "small" : "regular"} />;
                } else {
                    return <EnumValuesChip
                        enumKey={enumKey}
                        enumValues={enumValues}
                        small={small} />;
                }
            }
            }>

            {enumToObjectEntries(enumValues).map(([key, labelOrConfig]) => {

                const chip = <EnumValuesChip
                    enumKey={key}
                    enumValues={enumValues}
                    small={true} />;
                if (multiple) {
                    return (
                        <MenuItem key={`select-${name}-${key}`}
                            value={key}
                            disabled={isEnumValueDisabled(labelOrConfig)}
                            dense={true}>
                            <Checkbox
                                checked={Array.isArray(internalValue) && (internalValue as any[]).map(v => v.toString()).includes(key.toString())} />
                            <ListItemText primary={chip} />
                        </MenuItem>
                    );
                } else {
                    return (
                        <MenuItem key={`select-${name}-${key}`} value={key}
                            disabled={isEnumValueDisabled(labelOrConfig)}
                            dense={true}>
                            {chip}
                        </MenuItem>
                    );
                }
            })}
        </Select>
    );
}

import {
    Box,
    FilledInput,
    FormControl,
    FormControlLabel,
    FormHelperText,
    InputLabel,
    Switch,
    Theme,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { FieldDescription } from "../../form";
import { useClearRestoreValue } from "../../hooks";
import { FieldProps, MediaType, StringProperty } from "../../models";
import { PreviewComponent } from "../../preview";
import { LabelWithIcon } from "../components";




const formStyles = makeStyles((theme: Theme) => createStyles({
    inputLabel: {
        marginTop: theme.spacing(1 / 2),
        marginLeft: theme.spacing(1 / 2)
    },
    shrinkInputLabel: {
        marginTop: "-2px",
        marginLeft: theme.spacing(1 / 2)
    }
}))

interface TextFieldProps<T extends string | number> extends FieldProps<T> {
    allowInfinity?: boolean
}

/**
 * Generic text field.
 * This is one of the internal components that get mapped natively inside forms
 * and tables to the specified properties.
 * @category Form fields
 */
export function TextField<T extends string | number>({
    name,
    value,
    setValue,
    error,
    showError,
    disabled,
    autoFocus,
    property,
    includeDescription,
    allowInfinity,
    shouldAlwaysRerender
}: TextFieldProps<T>) {

    const classes = formStyles();

    let mediaType: MediaType | undefined;
    let multiline: boolean | undefined;
    if (property.dataType === "string") {
        const url = (property as StringProperty).config?.url;
        mediaType = typeof url === "string" ? url : undefined;
        multiline = (property as StringProperty).config?.multiline;
    }

    useClearRestoreValue({
        property,
        value,
        setValue
    });

    const isMultiline = !!multiline;

    const internalValue = value ?? (property.dataType === "string" ? "" : value === 0 ? 0 : "");

    const valueIsInfinity = internalValue === Infinity;
    const inputType = !valueIsInfinity && property.dataType === "number" ? "number" : undefined;

    const updateValue = (newValue: typeof internalValue | undefined) => {

        if (!newValue) {
            setValue(
                null
            );
        } else if (inputType === "number") {
            const numValue = parseFloat(newValue as string);
            setValue(
                numValue as T
            );
        } else {
            setValue(
                newValue
            );
        }
    };

    const filledInput = (
        <FilledInput
            sx={{
                minHeight: "64px"
            }}
            autoFocus={autoFocus}
            type={inputType}
            multiline={isMultiline}
            inputProps={{
                rows: 4
            }}
            value={valueIsInfinity ? "Infinity" : (value ?? "")}
            disabled={disabled}
            onChange={(evt) => {
                updateValue(evt.target.value as T);
            }}
        />
    );

    return (
        <>

            <FormControl
                variant="filled"
                required={property.validation?.required}
                error={showError}
                disabled={valueIsInfinity}
                fullWidth>

                <InputLabel
                    classes={{
                        root: classes.inputLabel,
                        shrink: classes.shrinkInputLabel
                    }}>
                    <LabelWithIcon property={property} />
                </InputLabel>

                {filledInput}

                <Box display={"flex"}>

                    <Box flexGrow={1}>
                        {showError && <FormHelperText>{error}</FormHelperText>}

                        {includeDescription &&
                            <FieldDescription property={property} />}
                    </Box>

                    {allowInfinity &&
                        <FormControlLabel
                            checked={valueIsInfinity}
                            style={{ marginRight: 0 }}
                            labelPlacement={"start"}
                            control={
                                <Switch
                                    size={"small"}
                                    type={"checkbox"}
                                    onChange={(evt) => {
                                        updateValue(
                                            evt.target.checked ? Infinity as T : undefined);
                                    }} />
                            }
                            disabled={disabled}
                            label={
                                <Typography variant={"caption"}>
                                    Set value to Infinity
                                </Typography>
                            }
                        />
                    }
                </Box>

            </FormControl>

            {mediaType && internalValue &&
                <ErrorBoundary>
                    <Box m={1}>
                        <PreviewComponent name={name}
                            value={internalValue}
                            property={property}
                            size={"regular"} />
                    </Box>
                </ErrorBoundary>
            }
        </>
    );

}

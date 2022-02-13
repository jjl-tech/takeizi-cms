import {
    FormControl,
    IconButton,
    InputAdornment,
    InputLabel,
    MenuItem,
    Select as MuiSelect,
    TextField as MuiTextField,
    Theme,
    Tooltip
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { ErrorMessage } from "formik";
import React from "react";
import {
    useClipboard, useSnackbarController
} from "../../hooks";
import {
    Entity,
    EntitySchema,
    EntityStatus
} from "../../models";



const formStyles = makeStyles((theme: Theme) => createStyles({
    paper: {
        elevation: 0,
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(2)
        }
    },
    largePadding: {
        padding: theme.spacing(2),
        [theme.breakpoints.up("md")]: {
            padding: theme.spacing(3)
        }
    },
    inputLabel: {
        marginTop: theme.spacing(1 / 2),
        marginLeft: theme.spacing(1 / 2)
    },
    shrinkInputLabel: {
        marginTop: "-2px",
        marginLeft: theme.spacing(1 / 2)
    },
    buttons: {
        display: "flex",
        justifyContent: "flex-end"
    },
    button: {
        margin: theme.spacing(1)
    },
    form: {
        marginTop: theme.spacing(2)
    },
    input: {
        minHeight: "64px"
    },
    select: {
        paddingTop: theme.spacing(1 / 2)
    },
    oneOfInput: {
        marginBottom: theme.spacing(2)
    }
}))

export function CustomIdField<M, UserType>
    ({ schema, status, onChange, error, entity }: {
        schema: EntitySchema<M>,
        status: EntityStatus,
        onChange: Function,
        error: boolean,
        entity: Entity<M> | undefined
    }) {

    const classes = formStyles();

    const disabled = status === "existing" || !schema.customId;
    const idSetAutomatically = status !== "existing" && !schema.customId;

    const hasEnumValues = typeof schema.customId === "object";

    const snackbarContext = useSnackbarController();
    const { copy } = useClipboard({
        onSuccess: (text) => snackbarContext.open({
            type: "success",
            message: `Copiado ${text}`
        })
    });

    const inputProps = {
        className: classes.input,
        endAdornment: entity
            ? (
                <InputAdornment position="end">
                    <IconButton onClick={(e) => copy(entity.id)}
                        aria-label="copy-id"
                        size="large">
                        <Tooltip title={"Copiar"}>
                            <svg
                                className={"MuiSvgIcon-root MuiSvgIcon-fontSizeSmall"}
                                fill={"currentColor"}
                                width="20" height="20" viewBox="0 0 24 24">
                                <path
                                    d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                            </svg>
                        </Tooltip>
                    </IconButton>
                </InputAdornment>
            )
            : undefined
    };

    const fieldProps: any = {
        label: idSetAutomatically ? "ID é criado automaticamente" : "ID",
        disabled: disabled,
        name: "id",
        type: null,
        value: entity && status === "existing" ? entity.id : undefined,
        variant: "filled"
    };

    return (
        <FormControl fullWidth
            error={error}
            {...fieldProps}
            key={"custom-id-field"}>

            {hasEnumValues && schema.customId &&
                <>
                    <InputLabel id={"id-label"}>{fieldProps.label}</InputLabel>
                    <MuiSelect
                        labelId={"id-label"}
                        className={classes.select}
                        error={error}
                        {...fieldProps}
                        onChange={(event: any) => onChange(event.target.value)}>
                        {Object.entries(schema.customId).map(([key, label]) =>
                            <MenuItem
                                key={`custom-id-item-${key}`}
                                value={key}>
                                {`${key} - ${label}`}
                            </MenuItem>)}
                    </MuiSelect>
                </>}

            {!hasEnumValues &&
                <MuiTextField {...fieldProps}
                    error={error}
                    InputProps={inputProps}
                    onChange={(event) => {
                        let value = event.target.value;
                        if (value) value = value.trim();
                        return onChange(value.length ? value : undefined);
                    }} />}

            <ErrorMessage name={"id"}
                component="div">
                {(_) => "You need to specify an ID"}
            </ErrorMessage>

        </FormControl>
    );
}


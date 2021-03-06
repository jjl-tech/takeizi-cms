import React from "react";

import { Divider, Theme } from "@mui/material";

import {
    PreviewComponent,
    PreviewComponentProps,
    PreviewSize
} from "../internal";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";
import { Property } from "../../models";

import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        array: {
            display: "flex",
            flexDirection: "column"
        },
        arrayItemBig: {
            margin: theme.spacing(1)
        }
    })
);

/**
 * @category Preview components
 */
export function ArrayPreview({
                                 name,
                                 value,
                                 property,
                                 size
                             }: PreviewComponentProps<any[]>) {

    if (!property.of) {
        throw Error(`You need to specify an 'of' prop (or specify a custom field) in your array property ${name}`);
    }

    const classes = useStyles();

    if (property.dataType !== "array")
        throw Error("Picked wrong preview component ArrayPreview");

    const values = value;

    if (!values) return null;

    const childSize: PreviewSize = size === "regular" ? "small" : "tiny";

    return (
        <div className={classes.array}>
            {values &&
            values.map((value, index) =>
                <React.Fragment key={"preview_array_" + value + "_" + index}>
                    <div className={classes.arrayItemBig}>
                        <ErrorBoundary>
                            <PreviewComponent
                                name={name}
                                value={value}
                                property={property.of as Property<any>}
                                size={childSize}/>
                        </ErrorBoundary>
                    </div>
                    {index < values.length - 1 && <Divider/>}
                </React.Fragment>
            )}
        </div>
    );
}

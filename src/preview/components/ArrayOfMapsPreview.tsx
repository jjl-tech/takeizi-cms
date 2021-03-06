import React from "react";
import { ArrayProperty, MapProperty } from "../../models";
import { ErrorBoundary } from "../../core/internal/ErrorBoundary";

import { Table, TableBody, TableCell, TableRow } from "@mui/material";
import { PreviewComponent, PreviewComponentProps } from "../internal";

/**
 * @category Preview components
 */
export function ArrayOfMapsPreview({
                                          name,
                                          value,
                                          property,
                                          size
                                      }: PreviewComponentProps<object[]>) {

    if (property.dataType !== "array" || !property.of || property.of.dataType !== "map")
        throw Error("Picked wrong preview component ArrayOfMapsPreview");

    const properties = ((property as ArrayProperty).of as MapProperty).properties;
    if (!properties) {
        throw Error(`You need to specify a 'properties' prop (or specify a custom field) in your map property ${name}`);
    }
    const values = value;
    const previewProperties = ((property as ArrayProperty).of as MapProperty).previewProperties;

    if (!values) return null;


    let mapProperties = previewProperties;
    if (!mapProperties || !mapProperties.length) {
        mapProperties = Object.keys(properties);
        if (size)
            mapProperties = mapProperties.slice(0, 3);
    }

    return (
        <Table size="small">
            <TableBody>
                {values &&
                values.map((v, index) => {
                    return (
                        <TableRow key={`table_${v}_${index}`}
                                  sx={{
                                      "&:last-child th, &:last-child td": {
                                          borderBottom: 0
                                      }
                                  }}>
                            {mapProperties && mapProperties.map(
                                (key) => (
                                    <TableCell
                                        key={`table-cell-${key as string}`}
                                        component="th"
                                    >
                                        <ErrorBoundary>
                                            <PreviewComponent
                                                name={key as string}
                                                value={(v as any)[key]}
                                                property={properties[key as string]}
                                                size={"small"}/>
                                        </ErrorBoundary>
                                    </TableCell>
                                )
                            )}
                        </TableRow>
                    );
                })}
            </TableBody>
        </Table>
    );
}

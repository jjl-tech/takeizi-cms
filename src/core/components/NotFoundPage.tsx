import { Box, Typography } from "@mui/material";
import React from "react";

export function NotFoundPage() {

    return (
        <Box
            display="flex"
            width={"100%"}
            height={"100%"}>
            <Box m="auto">
                <Typography variant={"h4"} align={"center"} gutterBottom={true}>
                    Página não encontrada
                </Typography>
                <Typography align={"center"}>
                    Esta página não existe ou foi removida.
                </Typography>
            </Box>
        </Box>
    );
}


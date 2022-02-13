/* @jsxImportSource @emotion/react */
import Brightness3Icon from "@mui/icons-material/Brightness3";
import Brightness5Icon from "@mui/icons-material/Brightness5";
import MenuIcon from "@mui/icons-material/Menu";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import {
    AppBar,
    Avatar,
    Box,
    Breadcrumbs, Button, Chip,
    Hidden,
    IconButton,
    Link,
    Slide,
    Theme,
    Toolbar,
    Typography
} from "@mui/material";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { Link as ReactLink } from "react-router-dom";
import { useAuthController, useModeState } from "../../hooks";
import { useBreadcrumbsContext } from "../../hooks/useBreadcrumbsContext";
import { ErrorBoundary } from "./ErrorBoundary";


const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        appbar: {},
        menuButton: {
            marginRight: theme.spacing(2)
        },
        breadcrumb: {
            backgroundColor: theme.palette.grey[100],
            height: theme.spacing(4),
            fontSize: 17,
            color: theme.palette.grey[800],
            fontWeight: 600,
            "&:hover, &:focus": {
                cursor: "pointer",
                backgroundColor: theme.palette.grey[300]
            },
            "&:active": {
                boxShadow: theme.shadows[1],
                backgroundColor: theme.palette.grey[400]
            }
        }
    })
);

interface CMSAppBarProps {
    title: string;
    handleDrawerToggle: () => void,
    /**
     * A component that gets rendered on the upper side of the main toolbar
     */
    toolbarExtraWidget?: React.ReactNode;
}


export function FireCMSAppBar({
    title,
    handleDrawerToggle,
    toolbarExtraWidget
}: CMSAppBarProps) {

    const classes = useStyles();

    const breadcrumbsContext = useBreadcrumbsContext();
    const { breadcrumbs } = breadcrumbsContext;

    const authController = useAuthController();
    const { mode, toggleMode } = useModeState();

    const initial = authController.user?.displayName
        ? authController.user.displayName[0].toUpperCase()
        : (authController.user?.email ? authController.user.email[0].toUpperCase() : "A");

    return (
        <Slide
            direction="down" in={true} mountOnEnter unmountOnExit>
            <AppBar
                className={classes.appbar}
                position={"relative"}
                elevation={1}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="Abrir menu lateral"
                        edge="start"
                        onClick={handleDrawerToggle}
                        className={classes.menuButton}
                        size="large">
                        <MenuIcon />
                    </IconButton>

                    <Hidden lgDown>
                        <Box mr={3}>
                            <Link
                                underline={"none"}
                                key={"breadcrumb-home"}
                                color="inherit"
                                component={ReactLink}
                                to={"/"}>
                                <Typography variant="h6" noWrap>
                                    {title}
                                </Typography>
                            </Link>
                        </Box>
                    </Hidden>

                    <Box mr={2}>
                        <Breadcrumbs
                            separator={<NavigateNextIcon
                                htmlColor={"rgb(0,0,0,0.87)"}
                                fontSize="small" />}
                            aria-label="breadcrumb">
                            {breadcrumbs.map((entry, index) => (
                                <Link
                                    underline={"none"}
                                    key={`breadcrumb-${index}`}
                                    color="inherit"
                                    component={ReactLink}
                                    to={entry.url}>
                                    <Chip
                                        classes={{ root: classes.breadcrumb }}
                                        label={entry.title}
                                    />
                                </Link>)
                            )
                            }
                        </Breadcrumbs>
                    </Box>

                    <Box flexGrow={1} />

                    {toolbarExtraWidget &&
                        <ErrorBoundary>
                            {
                                toolbarExtraWidget
                            }
                        </ErrorBoundary>}

                    <Box p={1} mr={1}>
                        <IconButton
                            color="inherit"
                            aria-label="Open drawer"
                            edge="start"
                            onClick={() => toggleMode()}
                            size="large">
                            {mode === "dark"
                                ? <Brightness3Icon />
                                : <Brightness5Icon />}
                        </IconButton>
                    </Box>

                    <Box p={1} mr={1}>
                        {authController.user && authController.user.photoURL
                            ? <Avatar
                                src={authController.user.photoURL} />
                            : <Avatar>{initial}</Avatar>
                        }
                    </Box>

                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={authController.signOut}>
                        Log Out
                    </Button>
                </Toolbar>
            </AppBar>
        </Slide>
    );
}

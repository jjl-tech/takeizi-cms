import {
    Box,
    Button,
    CircularProgress,
    Fade,
    Grid, Slide,
    TextField,
    Theme
} from "@mui/material";
import { useTheme } from "@mui/styles";
import createStyles from "@mui/styles/createStyles";
import makeStyles from "@mui/styles/makeStyles";
import { FirebaseApp } from "firebase/app";
import React, { useEffect, useRef, useState } from "react";
import { ErrorView } from "../../core";
import { FireCMSLogo } from "../../core/components/FireCMSLogo";
import { useAuthController, useModeState, useSnackbarController } from "../../hooks";
import {
    FirebaseAuthDelegate,
    FirebaseSignInOption,
    FirebaseSignInProvider
} from "../models/auth";
import {
    appleIcon,
    facebookIcon,
    githubIcon,
    googleIcon,
    microsoftIcon,
    twitterIcon
} from "./social_icons";

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        logo: {
            // padding: theme.spacing(3),
            height: 120,
            objectFit: "contain"
        }
    })
);

/**
 * @category Firebase
 */
export interface FirebaseLoginViewProps {
    skipLoginButtonEnabled?: boolean,
    logo?: string,
    signInOptions: Array<FirebaseSignInProvider | FirebaseSignInOption>;
    firebaseApp: FirebaseApp;
    authDelegate: FirebaseAuthDelegate
}

/**
 * Use this component to render a login view, that updates
 * the state of the {@link AuthController} based on the result
 * @constructor
 * @category Firebase
 */
export function FirebaseLoginView({
    skipLoginButtonEnabled,
    logo,
    signInOptions,
    firebaseApp,
    authDelegate
}: FirebaseLoginViewProps) {
    const classes = useStyles();
    const authController = useAuthController();
    const modeState = useModeState();
    const theme = useTheme();
    const snackBarContext = useSnackbarController();

    const [passwordLoginSelected, setPasswordLoginSelected] = useState(false);

    const resolvedSignInOptions: FirebaseSignInProvider[] = signInOptions.map((o) => {
        if (typeof o === "object") {
            return o.provider;
        } else return o as FirebaseSignInProvider;
    })

    function buildErrorView() {
        if (authDelegate.authError) {
            const codeError = authDelegate.authError?.code;

            if (codeError.includes("wrong-password") || codeError.includes("email-not-found")) {
                console.log("authDelegate.authError", authDelegate.authError.code);
                snackBarContext.open({
                    message: "E-mail ou senha incorretos",
                    type: "error"
                })
            } else if (codeError.includes("user-not-found")) {
                snackBarContext.open({
                    message: "E-mail não cadastrado",
                    type: "error"
                })
            } else {
                snackBarContext.open({
                    message: "Erro ao efetuar login, tente novamente",
                    type: "error"
                })
            }
        }
    }

    let logoComponent;
    if (logo) {
        logoComponent = <img className={classes.logo}
            src={logo}
            alt={"Logo"} />;
    } else {
        logoComponent = <div className={classes.logo}>
            <FireCMSLogo />
        </div>;
    }

    let notAllowedMessage: string | undefined;
    if (authController.notAllowedError) {
        if (typeof authController.notAllowedError === "string") {
            notAllowedMessage = authController.notAllowedError;
        } else if (authController.notAllowedError instanceof Error) {
            notAllowedMessage = authController.notAllowedError.message;
        } else {
            notAllowedMessage = "It looks like you don't have access to the CMS, based on the specified Authenticator configuration";
        }
    }

    if (authDelegate.authError) {
        const codeError = authDelegate.authError?.code;

        if (codeError.includes("wrong-password") || codeError.includes("email-not-found")) {
            console.log("authDelegate.authError", authDelegate.authError.code);
            snackBarContext.open({
                message: "E-mail ou senha incorretos",
                type: "error"
            })
        } else if (codeError.includes("user-not-found")) {
            snackBarContext.open({
                message: "E-mail não cadastrado",
                type: "error"
            })
        } else {
            snackBarContext.open({
                message: "Erro ao efetuar login, tente novamente",
                type: "error"
            })
        }
    }



    return (
        <>
            <Fade
                in={true}
                timeout={500}
                mountOnEnter
                unmountOnExit>
                <Box sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    backgroundColor: "#f6f7f8",
                    p: 2
                }}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        width: "100%",
                        backgroundColor: "#fff",
                        boxShadow: "0px 0px 10px rgba(0,0,0,0.2)",
                        borderRadius: "8px",
                        maxWidth: 500,
                        p: 5
                    }}>

                        <Box m={2}>
                            {logoComponent}
                        </Box>

                        {notAllowedMessage &&
                            <Box p={2}>
                                <ErrorView
                                    error={notAllowedMessage} />
                            </Box>}

                        {/* {buildErrorView()} */}

                        {/* {!passwordLoginSelected && <>
                        {buildOauthLoginButtons(authDelegate, resolvedSignInOptions, modeState.mode)}

                        {resolvedSignInOptions.includes("password") &&
                            <LoginButton
                                text={"E-mail e senha"}
                                icon={<EmailIcon fontSize={"large"} />}
                                onClick={() => setPasswordLoginSelected(true)} />}


                        {resolvedSignInOptions.includes("anonymous") &&
                            <LoginButton
                                text={"Log in anonymously"}
                                icon={<PersonOutlineIcon fontSize={"large"} />}
                                onClick={authDelegate.anonymousLogin} />}

                        {skipLoginButtonEnabled &&
                            <Box m={1}>
                                <Button onClick={authDelegate.skipLogin}>
                                    Skip login
                                </Button>
                            </Box>
                        }

                    </>} */}

                        <LoginForm
                            authDelegate={authDelegate}
                            onClose={() => setPasswordLoginSelected(false)}
                            mode={modeState.mode} />
                    </Box>
                </Box>
            </Fade>
        </>
    );
}

function LoginButton({
    icon,
    onClick,
    text
}: { icon: React.ReactNode, onClick: () => void, text: string }) {
    return (
        <Box m={0.5} width={"100%"}>
            <Button fullWidth
                variant="outlined"
                onClick={onClick}>
                <Box sx={{
                    p: "1",
                    display: "flex",
                    width: "240px",
                    height: "32px",
                    alignItems: "center",
                    justifyItems: "center"
                }}>
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "32px",
                        alignItems: "center",
                        justifyItems: "center"
                    }}>
                        {icon}
                    </Box>
                    <Box sx={{
                        flexGrow: 1,
                        pl: 2,
                        textAlign: "center"
                    }}>{text}</Box>
                </Box>
            </Button>
        </Box>
    )
}

function LoginForm({
    onClose,
    authDelegate,
    mode
}: { onClose: () => void, authDelegate: FirebaseAuthDelegate, mode: "light" | "dark" }) {

    const passwordRef = useRef<HTMLInputElement | null>(null);

    const [email, setEmail] = useState<string>();
    const [availableProviders, setAvailableProviders] = useState<string[] | undefined>();
    const [password, setPassword] = useState<string>();

    const shouldShowEmail = availableProviders === undefined;
    const loginMode = availableProviders && availableProviders.includes("password");
    const otherProvidersMode = availableProviders && !availableProviders.includes("password") && availableProviders.length > 0;
    const registrationMode = availableProviders && !availableProviders.includes("password");

    const snackBarContext = useSnackbarController();

    useEffect(() => {
        if ((loginMode || registrationMode) && passwordRef.current) {
            passwordRef.current.focus()
        }
    }, [loginMode, registrationMode]);

    function handleEnterPassword() {
        if (email && password) {
            authDelegate.emailPasswordLogin(email, password);
        }
    }

    const handleSubmit = (event: any) => {
        event.preventDefault();
        handleEnterPassword();
    }

    const label = registrationMode
        ? "Usuário não encontrado. Insira a senha para criar um novo usuário."
        : (loginMode ? "Digite sua senha" : "Digite seu e-mail");
    const button = registrationMode ? "Criar usuário" : (loginMode ? "Login" : "Ok");

    // if (otherProvidersMode) {
    //     return (
    //         <Grid container spacing={1}>
    //             <Grid item xs={12} sx={{ p: 1 }}>
    //                 <Typography align={"center"} variant={"subtitle2"}>
    //                     You already have an account
    //                 </Typography>
    //                 <Typography align={"center"} variant={"body2"}>
    //                     You can use one of these
    //                     methods to login with {email}
    //                 </Typography>
    //             </Grid>

    //             <Grid item xs={12}>
    //                 {availableProviders && buildOauthLoginButtons(authDelegate, availableProviders, mode)}
    //             </Grid>
    //         </Grid>
    //     );
    // }

    return (
        <Slide
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit>
            <form onSubmit={handleSubmit}>
                <Grid container spacing={1}>
                    <Grid item flexDirection="column" xs={12}>
                        <TextField
                            margin="normal"
                            fullWidth autoFocus
                            placeholder="E-mail"
                            value={email}
                            disabled={authDelegate.authLoading}
                            type="email"
                            onChange={(event) => setEmail(event.target.value)}
                        />

                        <TextField
                            fullWidth
                            placeholder="Senha"
                            value={password}
                            disabled={authDelegate.authLoading}
                            inputRef={passwordRef}
                            type="password"
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </Grid>

                    <Grid item mt={2} xs={12}>
                        <Box sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%"
                        }}>

                            <Button
                                style={{ textTransform: "capitalize" }}
                                onClick={() => {
                                    if (email) {
                                        // authDelegate.sendPasswordResetEmail(email);
                                    }
                                }}
                            >
                                Esqueceu sua senha?
                            </Button>

                            <Button
                                variant="outlined"
                                sx={{
                                    height: 45,
                                    width: 90
                                }}
                                size="large"
                                type="submit"
                            >
                                {!authDelegate.authLoading
                                    ? (
                                        <span>Login</span>
                                    )
                                    : (
                                        <CircularProgress
                                            size={20}
                                            thickness={5}
                                        />
                                    )}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </form>
        </Slide>
    );

}

function buildOauthLoginButtons(authDelegate: FirebaseAuthDelegate, providers: string[], mode: "light" | "dark") {
    return <>
        {providers.includes("google.com") && <LoginButton
            text={"Sign in with Google"}
            icon={googleIcon(mode)}
            onClick={authDelegate.googleLogin} />}

        {providers.includes("microsoft.com") && <LoginButton
            text={"Sign in with Microsoft"}
            icon={microsoftIcon(mode)}
            onClick={authDelegate.microsoftLogin} />}

        {providers.includes("apple.com") && <LoginButton
            text={"Sign in with Apple"}
            icon={appleIcon(mode)}
            onClick={authDelegate.appleLogin} />}

        {providers.includes("github.com") && <LoginButton
            text={"Sign in with Github"}
            icon={githubIcon(mode)}
            onClick={authDelegate.githubLogin} />}

        {providers.includes("facebook.com") && <LoginButton
            text={"Sign in with Facebook"}
            icon={facebookIcon(mode)}
            onClick={authDelegate.facebookLogin} />}

        {providers.includes("twitter.com") && <LoginButton
            text={"Sign in with Twitter"}
            icon={twitterIcon(mode)}
            onClick={authDelegate.twitterLogin} />}
    </>
}

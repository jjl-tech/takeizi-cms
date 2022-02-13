import { FirebaseApp, initializeApp } from "firebase/app";
import React, { useCallback, useEffect } from "react";


/**
 * @category Firebase
 */
export interface InitialiseFirebaseResult {
    firebaseConfigLoading: boolean,
    firebaseApp?: FirebaseApp;
    configError?: string,
    firebaseConfigError?: Error
}

/**
 * Function used to initialise Firebase, either by using the provided config,
 * or by fetching it by Firebase Hosting, if not specified.
 *
 * It works as a hook that gives you the loading state and the used
 * configuration.
 *
 * You most likely only need to use this if you are developing a custom app
 * that is not using {@link FirebaseCMSApp}. You can also not use this component
 * and initialise Firebase yourself.
 *
 * @param onFirebaseInit
 * @param firebaseConfig
 * @category Firebase
 */
export function useInitialiseFirebase({ firebaseConfig, onFirebaseInit }: {
    onFirebaseInit?: ((config: object) => void) | undefined,
    firebaseConfig: Object | undefined
}): InitialiseFirebaseResult {

    const [firebaseApp, setFirebaseApp] = React.useState<FirebaseApp | undefined>();
    const [firebaseConfigLoading, setFirebaseConfigLoading] = React.useState<boolean>(false);
    const [configError, setConfigError] = React.useState<string>();
    const [firebaseConfigError, setFirebaseConfigError] = React.useState<Error | undefined>();

    const initFirebase = useCallback((config: Object) => {
        try {
            const initialisedFirebaseApp = initializeApp(config);
            setFirebaseConfigError(undefined);
            setFirebaseConfigLoading(false);
            if (onFirebaseInit)
                onFirebaseInit(config);
            setFirebaseApp(initialisedFirebaseApp);
        } catch (e: any) {
            console.error(e);
            setFirebaseConfigError(e);
        }
    }, [onFirebaseInit]);

    useEffect(() => {
        setFirebaseConfigLoading(true);

        if (firebaseConfig) {
            initFirebase(firebaseConfig);
        } else if (process.env.NODE_ENV === "production") {
            fetch("/__/firebase/init.json")
                .then(async response => {
                    if (response && response.status < 300) {
                        const config = await response.json();
                        initFirebase(config);
                    }
                })
                .catch(e => {
                        setFirebaseConfigLoading(false);
                        setConfigError(
                            "Could not load Firebase configuration from Firebase hosting. " +
                            "If the app is not deployed in Firebase hosting, you need to specify the configuration manually" +
                            e.toString()
                        );
                    }
                );
        } else {
            setFirebaseConfigLoading(false);
            setConfigError(
                "You need to deploy the app to Firebase hosting or specify a Firebase configuration object"
            );
        }
    }, [firebaseConfig, initFirebase]);

    return {
        firebaseApp,
        firebaseConfigLoading,
        configError,
        firebaseConfigError
    };
}

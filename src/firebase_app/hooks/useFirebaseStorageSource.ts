import { FirebaseApp } from "firebase/app";
import {
    FirebaseStorage,
    getDownloadURL,
    getStorage,
    ref,
    uploadBytes
} from "firebase/storage";
import { useEffect, useState } from "react";
import { StorageSource, UploadFileProps } from "../../models";

/**
 * @category Firebase
 */
export interface FirebaseStorageSourceProps {
    firebaseApp?: FirebaseApp
}

/**
 * Use this hook to build an {@link StorageSource} based on Firebase storage
 * @category Firebase
 */
export function useFirebaseStorageSource({ firebaseApp }: FirebaseStorageSourceProps): StorageSource {

    const [storage, setStorage] = useState<FirebaseStorage>();

    useEffect(() => {
        if (!firebaseApp) return;
        setStorage(getStorage(firebaseApp));
    }, [firebaseApp]);

    const urlsCache: any = {};

    return {
        uploadFile({ file, fileName, path, metadata }: UploadFileProps)
            : Promise<any> {
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            const usedFilename = fileName ?? file.name;
            return uploadBytes(ref(storage, `${path}/${usedFilename}`), file, metadata).then(snapshot => ({
                path: snapshot.ref.fullPath
            }));
        },

        getDownloadURL(storagePath: string): Promise<string> {
            if (!storage) throw Error("useFirebaseStorageSource Firebase not initialised");
            if (urlsCache[storagePath])
                return urlsCache[storagePath];
            const downloadURL = getDownloadURL(ref(storage, storagePath));
            urlsCache[storagePath] = downloadURL;
            return downloadURL;
        }
    };
}

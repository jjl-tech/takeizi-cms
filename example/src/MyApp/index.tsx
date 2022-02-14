import {
    Authenticator,
    buildCollection, FirebaseCMSApp, NavigationBuilder,
    NavigationBuilderProps
} from "@camberi/firecms";
import { User as FirebaseUser } from "firebase/auth";
import { firebaseConfig } from "../firebase_config";
import Logo from './assets/logo.png';
import { BannerSchema } from "./schemas/Banners";
import { CategoriasSchema } from "./schemas/Categorias";
import { DepoimentosSchema } from "./schemas/Depoimentos";
import { ProdutoSchema } from "./schemas/Produtos";
import { SobreSchema } from "./schemas/Sobre";
import { TrabalhosSchema } from "./schemas/Trabalhos";


export const RabeloApp = () => {
    const navigation: NavigationBuilder = async ({
        user,
        authController
    }: NavigationBuilderProps) => {

        return ({
            collections: [
                buildCollection({
                    path: "produtos",
                    schema: ProdutoSchema,
                    name: "Produtos",
                    initialSort: ["nome", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin")
                    }),
                }),
                buildCollection({
                    path: "banners",
                    schema: BannerSchema,
                    name: "Banners",
                    initialSort: ["ordem", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin")
                    }),
                }),
                buildCollection({
                    path: "categorias",
                    schema: CategoriasSchema,
                    name: "Categorias",
                    initialSort: ["nome", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin"),
                    }),
                }),
                buildCollection({
                    path: "depoimentos",
                    schema: DepoimentosSchema,
                    name: "Depoimentos",
                    initialSort: ["autor", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin"),
                    }),
                }),
                buildCollection({
                    path: "sobre",
                    schema: SobreSchema,
                    name: "Sobre",
                    initialSort: ["titulo", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    callbacks: {
                        onPreDelete: async (deleteProps) => {
                            deleteProps.entity
                        }
                    },
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin"),
                    }),
                }),
                buildCollection({
                    path: "trabalhos",
                    schema: TrabalhosSchema,
                    name: "Trabalhos realizados",
                    initialSort: ["titulo", "asc"],
                    inlineEditing: false,
                    pagination: 10,
                    permissions: ({ authController }) => ({
                        edit: authController.extra.roles.includes("admin"),
                        create: authController.extra.roles.includes("admin"),
                        delete: authController.extra.roles.includes("admin"),
                    }),
                }),
            ]
        });
    };

    const myAuthenticator: Authenticator<FirebaseUser> = async ({
        user,
        authController
    }) => {
        const sampleUserData = await Promise.resolve({
            roles: ["admin"]
        });
        authController.setExtra(sampleUserData);
        return true;
    };

    return (
        <FirebaseCMSApp
            name={"CMS Rabelo"}
            authentication={myAuthenticator}
            navigation={navigation}
            firebaseConfig={firebaseConfig}
            primaryColor="#002c3e"
            secondaryColor="#9E7D38"
            signInOptions={[
                {
                    provider: 'password',
                },
            ]}
            locale="ptBR"
            logo={Logo}
            baseCollectionPath="admin"
        />
    )
}

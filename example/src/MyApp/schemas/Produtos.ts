import { buildProperty, buildSchema } from "@camberi/firecms";

type Produtos = {
    nome: string;
    imagem: string;
    categorias: string[];
    created_at: Date;
    updated_at: Date;
}

export const ProdutoSchema = buildSchema<Produtos>({
    name: "Produto",
    properties: {
        nome: {
            title: "Nome",
            validation: { required: true },
            dataType: "string"
        },
        imagem: buildProperty({
            title: "Imagem",
            dataType: "string",
            validation: { required: true },
            config: {
                storageMeta: {
                    mediaType: "image",
                    storeUrl: true,
                    storagePath: "produtos",
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000",
                    }
                }
            },
        }),
        categorias: buildProperty({
            title: "Categorias",
            dataType: "array",
            validation: { required: true },
            of: {
                dataType: "reference",
                path: "categorias" // you need to define a valid collection in this path
            }
        }),
        created_at: {
            title: "Criado em",
            dataType: "timestamp",
            autoValue: "on_update",
            columnWidth: 200,
        },
        updated_at: {
            title: "Atualizado em",
            dataType: "timestamp",
            autoValue: "on_update",
            columnWidth: 200,
        },
    }
});
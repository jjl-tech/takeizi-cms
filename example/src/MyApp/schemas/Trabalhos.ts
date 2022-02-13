import { buildProperty, buildSchema } from "@camberi/firecms";

type Trabalho = {
    titulo: string;
    imagem: string;
    created_at: Date;
    updated_at: Date;
}

export const TrabalhosSchema = buildSchema<Trabalho>({
    name: "Trabalhos Realizados",
    properties: {
        titulo: {
            dataType: "string",
            title: "Título",
            validation: { required: true }
        },
        imagem: buildProperty({
            title: "Imagem",
            dataType: "string",
            validation: { required: true },
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "sobre",
                    storeUrl: true,
                    acceptedFiles: ["image/*"],
                    metadata: {
                        cacheControl: "max-age=1000000",
                    }
                }
            },
        }),
        created_at: {
            title: "Criado em",
            dataType: "timestamp",
            autoValue: "on_create",
            columnWidth: 200,
        },
        updated_at: {
            title: "Atualizado em",
            dataType: "timestamp",
            autoValue: "on_update",
            columnWidth: 200,
        }
    }
});
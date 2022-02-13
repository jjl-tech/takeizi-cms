import { buildProperty, buildSchema } from "@camberi/firecms";

type Sobre = {
    descricao: string;
    imagem: string;
    titulo: string;
    created_at: Date;
    updated_at: Date;
}

export const SobreSchema = buildSchema<Sobre>({
    name: "Sobre",
    properties: {
        titulo: {
            dataType: "string",
            title: "Título",
            validation: { required: true }
        },
        descricao: {
            dataType: "string",
            title: "Descrição",
            validation: { required: true }
        },
        imagem: buildProperty({
            title: "Imagem",
            dataType: "string",
            validation: { required: true },
            config: {
                storageMeta: {
                    mediaType: "image",
                    storeUrl: true,
                    storagePath: "sobre",
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
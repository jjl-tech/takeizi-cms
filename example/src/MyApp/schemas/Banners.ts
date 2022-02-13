import { buildProperty, buildSchema } from "@camberi/firecms";

type Banner = {
    imagem: string;
    ordem: number;
    created_at: Date;
    updated_at: Date;
}

export const BannerSchema = buildSchema<Banner>({
    name: "Banner",
    properties: {
        imagem: buildProperty({
            title: "Imagem",
            dataType: "string",
            validation: { required: true },
            config: {
                storageMeta: {
                    mediaType: "image",
                    storagePath: "banners",
                    acceptedFiles: ["image/*"],
                    storeUrl: true,
                    metadata: {
                        cacheControl: "max-age=1000000",
                    }
                }
            },
        }),
        ordem: buildProperty({
            title: "Ordem",
            dataType: "number",
            validation: { required: true, positive: true, min: 1 },
            description: 'Ordem de exibição do banner',
            columnWidth: 200
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

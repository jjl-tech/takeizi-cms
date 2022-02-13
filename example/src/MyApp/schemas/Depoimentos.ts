import { buildSchema } from "@camberi/firecms";

type Depoimentos = {
    autor: string;
    descricao: string;
    created_at: Date;
    updated_at: Date;
}

export const DepoimentosSchema = buildSchema<Depoimentos>({
    name: "Depoimentos",
    properties: {
        autor: {
            dataType: "string",
            title: "Autor"
        },
        descricao: {
            dataType: "string",
            title: "Descrição",
            validation: { required: true }
        },
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
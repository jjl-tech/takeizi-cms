import { buildSchema } from "@camberi/firecms";

type Categorias = {
    nome: string;
    created_at: Date;
    updated_at: Date;
}

export const CategoriasSchema = buildSchema<Categorias>({
    name: "Categorias",
    properties: {
        nome: {
            dataType: "string",
            title: "Nome"
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
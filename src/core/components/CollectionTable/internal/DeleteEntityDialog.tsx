import {
    Button,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle
} from "@mui/material";
import React, { useCallback, useMemo, useState } from "react";
import {
    deleteEntityWithCallbacks,
    useDataSource,
    useFireCMSContext,
    useSnackbarController
} from "../../../../hooks";
import {
    Entity,
    EntityCallbacks,
    EntitySchema,
    EntitySchemaResolver
} from "../../../../models";
import { EntityPreview } from "../../index";


export interface DeleteEntityDialogProps<M extends { [Key: string]: any }> {
    entityOrEntitiesToDelete?: Entity<M> | Entity<M>[],
    path: string,
    schema: EntitySchema<M>,
    schemaResolver: EntitySchemaResolver<M>;
    open: boolean;
    onClose: () => void;
    callbacks?: EntityCallbacks<M>,

    onEntityDelete?(path: string, entity: Entity<M>): void;

    onMultipleEntitiesDelete?(path: string, entities: Entity<M>[]): void;
}

export function DeleteEntityDialog<M extends { [Key: string]: any }>({
    entityOrEntitiesToDelete,
    schemaResolver,
    onClose,
    open,
    callbacks,
    onEntityDelete,
    onMultipleEntitiesDelete,
    path,
    ...other
}
    : DeleteEntityDialogProps<M>) {

    const dataSource = useDataSource();
    const snackbarContext = useSnackbarController();
    const [loading, setLoading] = useState(false);

    const [entityOrEntities, setUsedEntityOrEntities] = React.useState<Entity<M> | Entity<M>[]>();
    const [multipleEntities, setMultipleEntities] = React.useState<boolean>();
    const context = useFireCMSContext();

    const schema = useMemo(() => schemaResolver({}), []);

    React.useEffect(() => {
        if (entityOrEntitiesToDelete) {
            const revisedEntityOrEntities = Array.isArray(entityOrEntitiesToDelete) && entityOrEntitiesToDelete.length === 1
                ? entityOrEntitiesToDelete[0]
                : entityOrEntitiesToDelete;
            setUsedEntityOrEntities(revisedEntityOrEntities);
            setMultipleEntities(Array.isArray(revisedEntityOrEntities));
        }
    }, [entityOrEntitiesToDelete]);

    const handleCancel = useCallback(() => {
        onClose();
    }, [onClose]);

    const onDeleteSuccess = useCallback((entity: Entity<any>) => {
        console.debug("Deleted", entity);
    }, []);

    const onDeleteFailure = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Erro ao deletar`,
            message: e?.message
        });

        console.error("Error deleting entity");
        console.error(e);
    }, [schema.name]);

    const onPreDeleteHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Erro ao deletar`,
            message: e?.message
        });
        console.error(e);
    }, [schema.name]);

    const onDeleteSuccessHookError = useCallback((entity: Entity<any>, e: Error) => {
        snackbarContext.open({
            type: "error",
            title: `${schema.name}: Error after deleting (entity is deleted)`,
            message: e?.message
        });
        console.error(e);
    }, [schema.name]);

    const performDelete = useCallback((entity: Entity<M>): Promise<boolean> =>
        deleteEntityWithCallbacks({
            dataSource,
            entity,
            schema,
            callbacks,
            onDeleteSuccess,
            onDeleteFailure,
            onPreDeleteHookError,
            onDeleteSuccessHookError,
            context
        }), [dataSource, schema, callbacks, onDeleteSuccess, onDeleteFailure, onPreDeleteHookError, onDeleteSuccessHookError, context]);

    const handleOk = useCallback(async () => {
        if (entityOrEntities) {

            setLoading(true);

            if (multipleEntities) {
                Promise.all((entityOrEntities as Entity<M>[]).map(performDelete)).then((results) => {

                    setLoading(false);

                    if (onMultipleEntitiesDelete && entityOrEntities)
                        onMultipleEntitiesDelete(path, entityOrEntities as Entity<M>[]);

                    if (results.every(Boolean)) {
                        snackbarContext.open({
                            type: "success",
                            message: "Deletado com sucesso"
                        });
                    } else if (results.some(Boolean)) {
                        snackbarContext.open({
                            type: "warning",
                            message: "Alguns registros não foram deletados"
                        });
                    } else {
                        snackbarContext.open({
                            type: "error",
                            message: "Erro ao deletar os dados"
                        });
                    }
                    onClose();
                });

            } else {
                performDelete(entityOrEntities as Entity<M>).then((success) => {
                    setLoading(false);
                    if (success) {
                        if (onEntityDelete && entityOrEntities)
                            onEntityDelete(path, entityOrEntities as Entity<M>);
                        snackbarContext.open({
                            type: "success",
                            message: "Deletado com sucesso"
                        });
                        onClose();
                    }
                });
            }
        }
    }, [entityOrEntities, multipleEntities, performDelete, onMultipleEntitiesDelete, path, onClose, snackbarContext, schema.name, onEntityDelete]);


    let content: JSX.Element;
    if (entityOrEntities && multipleEntities) {
        content = <div>Multiple entities</div>;
    } else {
        const entity = entityOrEntities as Entity<M> | undefined;
        const resolvedSchema = schemaResolver({
            entityId: entity?.id,
            values: entity?.values
        })
        content = entity
            ? <EntityPreview
                entity={entity}
                schema={resolvedSchema}
                path={path} />
            : <></>;
    }

    const dialogTitle = multipleEntities
        ? `${schema.name}: Deletar vários registros`
        : `Você tem certeza que deseja deletar este ${schema.name}?`;


    return (
        <Dialog
            maxWidth="md"
            aria-labelledby="delete-dialog"
            open={open}
            onBackdropClick={onClose}
            {...other}
        >
            <DialogTitle id="delete-dialog-title">
                {dialogTitle}
            </DialogTitle>

            {!multipleEntities && <DialogContent dividers>
                {content}
            </DialogContent>}

            <DialogActions>
                {loading && <CircularProgress size={16} thickness={8} />}

                <Button onClick={handleCancel}
                    disabled={loading}
                    color="primary">
                    Cancelar
                </Button>
                <Button
                    autoFocus
                    variant="outlined"
                    disabled={loading}
                    onClick={handleOk}
                    color="primary">
                    Ok, deletar
                </Button>
            </DialogActions>

        </Dialog>
    );
}


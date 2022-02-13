import {
    DataSource,
    DeleteEntityProps,
    Entity,
    EntityCallbacks,
    EntityOnDeleteProps,
    FireCMSContext,
    ResolvedEntitySchema
} from "../../models";

/**
 * @category Hooks and utilities
 */
export type DeleteEntityWithCallbacksProps<M> =
    DeleteEntityProps<M>
    & {
    callbacks?: EntityCallbacks<M>;
    onDeleteSuccess?: (entity: Entity<M>) => void;
    onDeleteFailure?: (entity: Entity<M>, e: Error) => void;
    onPreDeleteHookError?: (entity: Entity<M>, e: Error) => void;
    onDeleteSuccessHookError?: (entity: Entity<M>, e: Error) => void;
}

/**
 * This function is in charge of deleting an entity in the datasource.
 * It will run all the delete callbacks specified in the schema.
 * It is also possible to attach callbacks on save success or error, and callback
 * errors.
 *
 * If you just want to delete the data without running the `onPreDelete`,
 * and `onDelete` callbacks, you can use the `deleteEntity` method
 * in the datasource ({@link useDataSource}).
 *
 * @param dataSource
 * @param entity
 * @param schema
 * @param callbacks
 * @param onDeleteSuccess
 * @param onDeleteFailure
 * @param onPreDeleteHookError
 * @param onDeleteSuccessHookError
 * @param context
 * @category Hooks and utilities
 */
export async function deleteEntityWithCallbacks<M, UserType>({
                                                                 dataSource,
                                                                 entity,
                                                                 schema,
                                                                 callbacks,
                                                                 onDeleteSuccess,
                                                                 onDeleteFailure,
                                                                 onPreDeleteHookError,
                                                                 onDeleteSuccessHookError,
                                                                 context
                                                             }: DeleteEntityWithCallbacksProps<M> & {
                                                                 schema: ResolvedEntitySchema<M>,
                                                                 dataSource: DataSource,
                                                                 context: FireCMSContext<UserType>
                                                             }
): Promise<boolean> {

    const entityDeleteProps: EntityOnDeleteProps<M> = {
        entity,
        schema,
        entityId: entity.id,
        path: entity.path,
        context
    };

    if (callbacks?.onPreDelete) {
        try {
            await callbacks.onPreDelete(entityDeleteProps);
        } catch (e: any) {
            console.error(e);
            if (onPreDeleteHookError)
                onPreDeleteHookError(entity, e);
            return false;
        }
    }
    return dataSource.deleteEntity({
        entity
    }).then(() => {
        onDeleteSuccess && onDeleteSuccess(entity);
        try {
            if (callbacks?.onDelete) {
                callbacks.onDelete(entityDeleteProps);
            }
            return true;
        } catch (e: any) {
            if (onDeleteSuccessHookError)
                onDeleteSuccessHookError(entity, e);
            return false;
        }
    }).catch((e) => {
        if (onDeleteFailure) onDeleteFailure(entity, e);
        return false;
    });
}

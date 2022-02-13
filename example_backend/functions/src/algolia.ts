import algoliasearch from "algoliasearch";
import * as functions from 'firebase-functions';

const ALGOLIA_ID = functions.config().algolia.app_id;
const ALGOLIA_ADMIN_KEY = functions.config().algolia.api_key;

const client = algoliasearch(ALGOLIA_ID, ALGOLIA_ADMIN_KEY);

export function indexInAlgolia(indexName: string, data: any, id: string) {
    const entry = {...data};
    entry.objectID = id;
    const index = client.initIndex(indexName);
    return index.saveObject(entry).then((res) => {
        return res;
    });
}

export function deleteInAlgolia(indexName: string, id: string) {
    const index = client.initIndex(indexName);
    return index.deleteObject(id).then((res) => {
        return res;
    });
}

import { EntityCollection, NavigationContext } from "../../models";

export function removeInitialAndTrailingSlashes(s: string): string {
    return removeInitialSlash(removeTrailingSlash(s));
}

export function removeInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s.slice(1);
    else return s;
}

export function removeTrailingSlash(s: string) {
    if (s.endsWith("/"))
        return s.slice(0, -1);
    else return s;
}


export function addInitialSlash(s: string) {
    if (s.startsWith("/"))
        return s;
    else return `/${s}`;
}

export function getLastSegment(path: string) {
    const cleanPath = removeInitialAndTrailingSlashes(path);
    if (cleanPath.includes("/")) {
        const segments = cleanPath.split("/");
        return segments[segments.length - 1];
    }
    return cleanPath;
}


/**
 * Find the corresponding view at any depth for a given path.
 * @param path
 * @param collections
 */
export function getCollectionByPath<M>(path: string, collections?: EntityCollection[]): EntityCollection<M> | undefined {

    if (!collections)
        return undefined;

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    if (subpaths.length % 2 === 0) {
        throw Error(`Collection paths must have an odd number of segments: ${path}`);
    }

    return getCollectionFromCollectionsInternal(removeInitialAndTrailingSlashes(path), collections);

}

function getCollectionFromCollectionsInternal<M extends { [Key: string]: any }>(path: string, collectionViews: EntityCollection[]): EntityCollection | undefined {

    const subpaths = removeInitialAndTrailingSlashes(path).split("/");
    const subpathCombinations = getCollectionPathsCombinations(subpaths);

    let result: EntityCollection | undefined;
    for (let i = 0; i < subpathCombinations.length; i++) {
        const subpathCombination = subpathCombinations[i];
        const navigationEntry = collectionViews && collectionViews.find((entry) => entry.path === subpathCombination);

        if (navigationEntry) {

            if (subpathCombination === path) {
                result = navigationEntry;
            } else if (navigationEntry.subcollections) {
                const newPath = path.replace(subpathCombination, "").split("/").slice(2).join("/");
                if (newPath.length > 0)
                    result = getCollectionFromCollectionsInternal(newPath, navigationEntry.subcollections);
            }
        }
        if (result) break;
    }
    return result;
}

/**
 * Get the subcollection combinations from a path:
 * "sites/es/locales" => ["sites/es/locales", "sites"]
 * @param subpaths
 */
export function getCollectionPathsCombinations(subpaths: string[]): string[] {
    const entries = subpaths.length > 0 && subpaths.length % 2 === 0 ? subpaths.splice(0, subpaths.length - 1) : subpaths;

    const length = entries.length;
    const result: string[] = [];
    for (let i = length; i > 0; i = i - 2) {
        result.push(entries.slice(0, i).join("/"));
    }
    return result;

}

export interface TopNavigationEntry {
    url: string;
    name: string;
    description?: string;
    group?: string;
}

export type TopNavigationResult = {
    navigationEntries: TopNavigationEntry[],
    groups: string[]
};

export function computeTopNavigation(
    navigationContext: NavigationContext,
    includeHiddenViews: boolean
): TopNavigationResult {

    const navigation = navigationContext.navigation;
    if (!navigation)
        throw Error("You can only use `computeTopNavigation` with an initialised navigationContext");

    const navigationEntries: TopNavigationEntry[] = [
        ...navigation.collections.map(collection => ({
            url: navigationContext.buildUrlCollectionPath(collection.path),
            name: collection.name,
            description: collection.description,
            group: collection.group
        })),
        ...(navigation.views ?? []).map(view =>
            includeHiddenViews || !view.hideFromNavigation
                ? ({
                    url: navigationContext.buildCMSUrlPath(Array.isArray(view.path) ? view.path[0] : view.path),
                    name: view.name,
                    description: view.description,
                    group: view.group
                })
                : undefined)
            .filter((view) => !!view) as TopNavigationEntry[]
    ];

    const groups: string[] = Array.from(new Set(
        Object.values(navigationEntries).map(e => e.group).filter(Boolean) as string[]
    ).values());

    return { navigationEntries, groups };
}

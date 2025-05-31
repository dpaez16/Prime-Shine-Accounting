/**
 *
 * @param query query string from input
 * @param objects array of objects to search
 * @param field field to search from either keyof object or a function that constructs it from the object itself
 * @returns
 */
export function textQueryObjects<T>(query: string, objects: T[], field: (object: T) => string): T[] {
    if (!query) {
        return objects;
    }

    const filteredObjects = [] as T[];
    const queryParts = query.toLowerCase().split(' ');

    for (const object of objects) {
        const name = field(object).toString().toLowerCase();

        // Checks if all parts of the query are present in the object's name
        // This is quite primitive, we might want to consider fuzzy search in the future.
        const queryMatchesObject = queryParts.every(part => name.includes(part));

        if (queryMatchesObject) {
            filteredObjects.push(object);
        }
    }

    return filteredObjects;
}
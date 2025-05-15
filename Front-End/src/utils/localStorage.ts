function getLocalStorageItem(key: string) {
    try {
        return localStorage.getItem(key);
    } catch (err) {
        console.log(err);
        return null;
    }
}

export function getLocalStorageObject<T>(key: string) {
    const value = getLocalStorageItem(key);
    if (value) {
        return JSON.parse(value) as T;
    }

    return null;
}

export function removeLocalStorageItem(key: string) {
    localStorage.removeItem(key);
}

import { getLocalStorageObject } from '@/utils/localStorage';
import { useState } from 'react';

export default function useLocalStorage<T>(key: string) {
    const [localStorageValue, setLocalStorageValue] = useState(() => {
        return getLocalStorageObject<T>(key);
    });

    const setLocalStorageStateValue = (value: T | null) => {
        localStorage.setItem(key, JSON.stringify(value));
        setLocalStorageValue(value);
    };

    return {
        localStorageValue,
        setLocalStorageValue: setLocalStorageStateValue,
    };
}

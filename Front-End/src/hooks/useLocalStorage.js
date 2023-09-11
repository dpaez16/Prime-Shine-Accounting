import { useState } from "react";
  
export default function useLocalStorage(key, defaultValue) {
    const [localStorageValue, setLocalStorageValue] = useState(() => {
        try {
            const value = localStorage.getItem(key)
            
            if (value) {
                return JSON.parse(value);
            } else {
                localStorage.setItem(key, JSON.stringify(defaultValue));
                return defaultValue;
            }
        } catch (error) {
            localStorage.setItem(key, JSON.stringify(defaultValue));
            return defaultValue;
        }
    });
  
    const setLocalStorageStateValue = (valueOrFunction) => {
        let newValue;
        if (typeof valueOrFunction === 'function') {
            const f = valueOrFunction;
            newValue = f(localStorageValue);
        } else {
            newValue = valueOrFunction;
        }

        localStorage.setItem(key, JSON.stringify(newValue));
        setLocalStorageValue(newValue);
    };

    return [localStorageValue, setLocalStorageStateValue];
};
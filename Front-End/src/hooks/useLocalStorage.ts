import { useState } from 'react';

// eslint-disable-next-line
export type SetStorageValue = (val: any) => void;

export default function useLocalStorage(key, defaultValue) {
  const [localStorageValue, setLocalStorageValue] = useState(() => {
    try {
      const value = localStorage.getItem(key);

      if (value) {
        return JSON.parse(value);
      } else {
        localStorage.setItem(key, JSON.stringify(defaultValue));
        return defaultValue;
      }
    } catch (error) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      console.log(error);
      return defaultValue;
    }
  });

  const setLocalStorageStateValue: SetStorageValue = (valueOrFunction) => {
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
}

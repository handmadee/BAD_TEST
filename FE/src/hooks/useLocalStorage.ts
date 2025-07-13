import { useState, useEffect } from "react";

/**
 * Hook để lưu trữ state trong localStorage với sync tự động
 * Cải thiện UX bằng cách persistent data và sync giữa tabs
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    // State để lưu giá trị
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === "undefined") {
            return initialValue;
        }
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
            return initialValue;
        }
    });

    // Hàm để set giá trị
    const setValue = (value: T | ((val: T) => T)) => {
        try {
            // Cho phép value là function như useState
            const valueToStore =
                value instanceof Function ? value(storedValue) : value;

            setStoredValue(valueToStore);

            if (typeof window !== "undefined") {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));

                // Dispatch custom event để sync giữa tabs
                window.dispatchEvent(
                    new CustomEvent("localStorage-change", {
                        detail: { key, value: valueToStore },
                    })
                );
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    };

    // Listen cho changes từ tabs khác
    useEffect(() => {
        if (typeof window === "undefined") return;

        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.warn(
                        `Error parsing localStorage value for key "${key}":`,
                        error
                    );
                }
            }
        };

        const handleCustomStorageChange = (e: CustomEvent) => {
            if (e.detail.key === key) {
                setStoredValue(e.detail.value);
            }
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener(
            "localStorage-change",
            handleCustomStorageChange as EventListener
        );

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener(
                "localStorage-change",
                handleCustomStorageChange as EventListener
            );
        };
    }, [key]);

    return [storedValue, setValue] as const;
}

import { useEffect, useRef, RefObject } from "react";

/**
 * Hook để detect click bên ngoài element
 * Cải thiện UX cho dropdowns, modals, popups
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
    callback: () => void,
    enabled: boolean = true
): RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                callback();
            }
        };

        // Delay để tránh trigger ngay khi component mount
        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [callback, enabled]);

    return ref;
}

/**
 * Hook để detect click bên ngoài multiple elements
 * Hữu ích khi có nhiều refs cần check
 */
export function useClickOutsideMultiple(
    refs: RefObject<HTMLElement>[],
    callback: () => void,
    enabled: boolean = true
): void {
    useEffect(() => {
        if (!enabled) return;

        const handleClickOutside = (event: MouseEvent) => {
            const isOutside = refs.every(
                (ref) => !ref.current?.contains(event.target as Node)
            );

            if (isOutside) {
                callback();
            }
        };

        const timeoutId = setTimeout(() => {
            document.addEventListener("mousedown", handleClickOutside);
        }, 0);

        return () => {
            clearTimeout(timeoutId);
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [refs, callback, enabled]);
}

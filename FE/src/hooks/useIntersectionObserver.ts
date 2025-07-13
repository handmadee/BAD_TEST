import { useEffect, useRef, useState, RefObject } from "react";

/**
 * Hook để observe element intersection với viewport
 * Cải thiện UX với lazy loading, infinite scroll, animations
 */
export function useIntersectionObserver<T extends HTMLElement = HTMLElement>(
    options: IntersectionObserverInit = {}
): [RefObject<T>, boolean, IntersectionObserverEntry | null] {
    const ref = useRef<T>(null);
    const [isIntersecting, setIsIntersecting] = useState(false);
    const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsIntersecting(entry.isIntersecting);
                setEntry(entry);
            },
            {
                threshold: 0.1,
                rootMargin: "50px",
                ...options,
            }
        );

        observer.observe(element);

        return () => {
            observer.unobserve(element);
            observer.disconnect();
        };
    }, [options.threshold, options.rootMargin, options.root]);

    return [ref, isIntersecting, entry];
}

/**
 * Hook để lazy load images khi vào viewport
 * Cải thiện performance và UX
 */
export function useLazyImage(
    src: string
): [RefObject<HTMLImageElement>, boolean, string | null] {
    const [ref, isIntersecting] = useIntersectionObserver<HTMLImageElement>({
        threshold: 0.1,
        rootMargin: "100px",
    });
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (isIntersecting && !imageSrc) {
            setImageSrc(src);
        }
    }, [isIntersecting, src, imageSrc]);

    useEffect(() => {
        if (imageSrc) {
            const img = new Image();
            img.onload = () => setIsLoaded(true);
            img.src = imageSrc;
        }
    }, [imageSrc]);

    return [ref, isLoaded, imageSrc];
}

/**
 * Hook để infinite scroll
 * Load thêm data khi scroll gần cuối
 */
export function useInfiniteScroll<T extends HTMLElement = HTMLElement>(
    callback: () => void,
    hasMore: boolean = true
): RefObject<T> {
    const [ref, isIntersecting] = useIntersectionObserver<T>({
        threshold: 1.0,
        rootMargin: "100px",
    });

    useEffect(() => {
        if (isIntersecting && hasMore) {
            callback();
        }
    }, [isIntersecting, hasMore, callback]);

    return ref;
}

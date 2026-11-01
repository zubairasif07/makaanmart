import { useState, useEffect, useRef, useCallback } from 'react';

// ─── useDebounce ─────────────────────────────────────────────────────────────
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// ─── useLocalStorage ──────────────────────────────────────────────────────────
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue] as const;
}

// ─── useClickOutside ─────────────────────────────────────────────────────────
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [callback]);
  return ref;
}

// ─── useIntersectionObserver ──────────────────────────────────────────────────
export function useIntersectionObserver(
  options?: IntersectionObserverInit,
) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, options);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [options]);

  return { ref, isVisible };
}

// ─── useMediaQuery ────────────────────────────────────────────────────────────
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [query]);
  return matches;
}

// ─── useRecentlyViewed ────────────────────────────────────────────────────────
export function useRecentlyViewed(max = 6) {
  const [viewed, setViewed] = useLocalStorage<string[]>('recentlyViewed', []);

  const addViewed = useCallback((id: string) => {
    setViewed((prev) => {
      const filtered = prev.filter((p) => p !== id);
      return [id, ...filtered].slice(0, max);
    });
  }, [setViewed, max]);

  return { viewed, addViewed };
}

// ─── useCompare ───────────────────────────────────────────────────────────────
export function useCompare(max = 3) {
  const [compareList, setCompareList] = useLocalStorage<string[]>('compareList', []);

  const toggleCompare = useCallback((id: string) => {
    setCompareList((prev) => {
      if (prev.includes(id)) return prev.filter((p) => p !== id);
      if (prev.length >= max) return prev;
      return [...prev, id];
    });
  }, [setCompareList, max]);

  const clearCompare = () => setCompareList([]);
  const isInCompare = (id: string) => compareList.includes(id);

  return { compareList, toggleCompare, clearCompare, isInCompare };
}

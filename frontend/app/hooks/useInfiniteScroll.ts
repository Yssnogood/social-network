import { useEffect, useRef, useCallback, useState } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  debounceMs?: number;
  rootMargin?: string;
  root?: Element | null;
}

export function useInfiniteScroll(
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean,
  options: UseInfiniteScrollOptions = {}
) {
  const {
    threshold = 0.1,
    debounceMs = 300,
    rootMargin = '50px',
    root = null
  } = options;

  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isDebouncing, setIsDebouncing] = useState(false);

  const debouncedCallback = useCallback(() => {
    if (isDebouncing || isLoading || !hasMore) return;

    setIsDebouncing(true);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback();
      setIsDebouncing(false);
    }, debounceMs);
  }, [callback, hasMore, isLoading, isDebouncing, debounceMs]);

  useEffect(() => {
    if (!targetRef.current) return;

    const observerOptions: IntersectionObserverInit = {
      root,
      rootMargin,
      threshold
    };

    observerRef.current = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoading) {
        debouncedCallback();
      }
    }, observerOptions);

    if (targetRef.current) {
      observerRef.current.observe(targetRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [debouncedCallback, hasMore, isLoading, rootMargin, threshold, root]);

  return targetRef;
}

// Hook pour gérer la pagination
export function usePagination<T>(
  fetchFunction: (page: number, limit: number) => Promise<T[]>,
  limit: number = 10
) {
  const [items, setItems] = useState<T[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const newItems = await fetchFunction(page, limit);
      
      if (newItems.length < limit) {
        setHasMore(false);
      }

      setItems(prev => [...prev, ...newItems]);
      setPage(prev => prev + 1);
    } catch (err) {
      setError(err as Error);
      console.error('Error loading more items:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFunction, page, limit, isLoading, hasMore]);

  const reset = useCallback(() => {
    setItems([]);
    setPage(1);
    setHasMore(true);
    setError(null);
  }, []);

  // Charger la première page
  useEffect(() => {
    loadMore();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    items,
    hasMore,
    isLoading,
    error,
    loadMore,
    reset
  };
}
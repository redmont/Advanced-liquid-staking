import { useRef, useCallback, useEffect } from 'react';

const wait = (ms: number) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout exceeded')), ms),
  );

const useStateWatcher = <State = unknown>(state: State) => {
  const resolveQueueRef = useRef<((value: State) => void)[]>([]);
  const timeoutRefs = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    resolveQueueRef.current.forEach((resolve) => resolve(state));
    resolveQueueRef.current = [];

    timeoutRefs.current.forEach(clearTimeout);
    timeoutRefs.current = [];
  }, [state]);

  return useCallback((timeout = 5000) => {
    const promise = new Promise<State>((resolve) => {
      resolveQueueRef.current.push(resolve);

      const timeoutId = setTimeout(() => {
        const index = resolveQueueRef.current.indexOf(resolve);
        if (index !== -1) {
          resolveQueueRef.current.splice(index, 1);
        }
      }, timeout);

      timeoutRefs.current.push(timeoutId);
    });

    return Promise.race([wait(timeout), promise]);
  }, []);
};

export default useStateWatcher;

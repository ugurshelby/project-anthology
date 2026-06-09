'use client';

import { useCallback, useState } from 'react';

export function useWillChange<T extends string>(property: T) {
  const [willChange, setWillChange] = useState<T | 'auto'>('auto');

  const onStart = useCallback(() => {
    setWillChange(property);
  }, [property]);

  const onEnd = useCallback(() => {
    setWillChange('auto');
  }, []);

  return { willChange, onStart, onEnd };
}

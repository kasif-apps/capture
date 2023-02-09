import React, { useCallback } from 'react';

export function assignRef<T = any>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === 'function') {
    ref(value);
  } else if (typeof ref === 'object' && ref !== null && 'current' in ref) {
    // eslint-disable-next-line no-param-reassign
    ref.current = value;
  }
}

type Ref<T> = React.Dispatch<React.SetStateAction<T>> | React.ForwardedRef<T>;

export function mergeRefs<T extends React.ForwardedRef<T> = any>(...refs: Ref<T>[]) {
  return (node: T | null) => {
    refs.forEach((ref) => assignRef(ref as T, node));
  };
}

export function useMergedRef<T extends React.ForwardedRef<T> = any>(...refs: Ref<T>[]) {
  return useCallback(mergeRefs(...refs), refs);
}

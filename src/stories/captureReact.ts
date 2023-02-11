import React, { useRef, useEffect } from 'react';
import { CaptureOptions, createCapturer, CaptureChangeEvent } from '../lib';
import { useResizeObserver } from './useResizeObserver';

export function useCapture<T extends HTMLElement>(options: CaptureOptions) {
  const [ref, rect] = useResizeObserver<T>();
  const cancel = useRef<() => void>(() => {});

  useEffect(() => {
    if (ref.current) {
      const { unsubscribe, cancel: c } = createCapturer(ref.current, options);
      cancel.current = c;

      return () => {
        unsubscribe();
      };
    }
  }, [ref, rect]);

  useEffect(() => {
    cancel.current();
  }, [rect]);

  return { ref, cancel };
}

export const CaptureTarget: React.FC<{
  id: string;
  children: React.ReactNode;
  onCaptureStateChange?: (e: CustomEvent<CaptureChangeEvent>) => void;
}> = (props) => {
  const ref = useRef<HTMLElement>(null);

  // @ts-ignore
  const copy = React.cloneElement(React.Children.only(props.children), {
    'data-capture-target': props.id,
    ref,
  });

  useEffect(() => {
    const listener = (e: CustomEvent<CaptureChangeEvent>) => {
      props.onCaptureStateChange?.(e);
    };

    if (ref.current) {
      ref.current.addEventListener('capture-state-change', listener as EventListener);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('capture-state-change', listener as EventListener);
      }
    };
  }, [ref.current]);

  return copy;
};

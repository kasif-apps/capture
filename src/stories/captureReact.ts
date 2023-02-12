import React, { useRef, useEffect } from 'react';
import {
  createCapturer,
  CaptureChangeEvent,
  CaptureTickEvent,
  CaptureEdgeEvent,
} from '../lib';
import { useResizeObserver } from './useResizeObserver';

export interface CaptureOptions {
  onCaptureTick?: (event: CustomEvent<CaptureTickEvent>) => void;
  onCaptureEnd?: (event: CustomEvent<CaptureEdgeEvent>) => void;
  onCaptureStart?: (event: CustomEvent<CaptureEdgeEvent>) => void;
}

export function useCapture<T extends HTMLElement>(options: CaptureOptions) {
  const [ref, rect] = useResizeObserver<T>();
  const cancel = useRef<() => void>(() => {});

  useEffect(() => {
    if (ref.current) {
      const { destroy, cancel: c } = createCapturer(ref.current);
      cancel.current = c;

      if (options.onCaptureTick) {
        ref.current.addEventListener('capture-tick', options.onCaptureTick as EventListener);
      }

      if (options.onCaptureEnd) {
        ref.current.addEventListener('capture-end', options.onCaptureEnd as EventListener);
      }

      if (options.onCaptureStart) {
        ref.current.addEventListener('capture-start', options.onCaptureStart as EventListener);
      }

      return () => {
        destroy();

        if (ref.current) {
          ref.current.removeEventListener('capture-tick', options.onCaptureTick as EventListener);
          ref.current.removeEventListener('capture-end', options.onCaptureEnd as EventListener);
          ref.current.removeEventListener('capture-start', options.onCaptureStart as EventListener);
        }
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

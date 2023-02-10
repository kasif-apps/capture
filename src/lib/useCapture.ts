import { useEffect, useRef } from 'react';
import { Area, Vector2D } from './math';
import { useResizeObserver } from './useResizeObserver';
import { generateId, getScroll, hasDataAttribute } from './util';

export interface CaptureOptions {
  onCapture?: (event: CaptureTickEvent) => void;
  onCaptureEnd?: (event: CaptureEdgeEvent) => void;
  onCaptureStart?: (event: CaptureEdgeEvent) => void;
}

export interface CaptureChangeEvent {
  area: Area;
  captured: boolean;
  id: string;
  mouseEvent: MouseEvent;
}

export interface CaptureTickEvent {
  area: Area;
  updated: boolean;
  mouseEvent: MouseEvent;
}

export interface CaptureEdgeEvent {
  area: Area;
  mouseEvent: MouseEvent;
}

export function useCapture<T extends HTMLElement>(options: CaptureOptions) {
  const id = generateId();
  const [ref, rect] = useResizeObserver<T>();
  const isDragging = useRef(false);
  const area = useRef(new Area(new Vector2D(0, 0), new Vector2D(0, 0)));
  const start = useRef(new Vector2D(0, 0));
  const end = useRef(new Vector2D(0, 0));
  const shouldDispatch = useRef(false);
  const lastEvent = useRef<MouseEvent | null>(null);

  const capturables = useRef<HTMLElement[]>([]);

  const cancel = () => {
    isDragging.current = false;
    shouldDispatch.current = false;
  };

  const notifyCapturables = (event: MouseEvent, bypass = false) => {
    capturables.current.forEach((element) => {
      const id = element.getAttribute('data-capture-target');
      const captured = !!element.getAttribute('data-captured');

      if (bypass) {
        element.dispatchEvent(
          new CustomEvent('capture-change', {
            detail: { area: area.current, captured: false, id, mouseEvent: event },
          })
        );
        return;
      }

      const intersects = Area.fromElement(element, getScroll(element)).intersects(area.current);

      if (intersects && captured) {
        element.dispatchEvent(
          new CustomEvent('capture-change', {
            detail: { area: area.current, captured: true, id, mouseEvent: event },
          })
        );
        element.setAttribute('data-captured', 'true');
      } else {
        element.dispatchEvent(
          new CustomEvent('capture-change', {
            detail: { area: area.current, captured: false, id, mouseEvent: event },
          })
        );
        element.setAttribute('data-captured', 'false');
      }
    });
  };

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-capture-source', 'true');
      ref.current.setAttribute('data-capture-source-id', id);

      capturables.current = Array.from(
        document.querySelectorAll(`[data-capture-source-id=${id}] [data-capture-target]`)
      );

      capturables.current.forEach((element) => {
        element.setAttribute('data-captured', 'false');
      });

      const handleMouseDown = (event: MouseEvent) => {
        notifyCapturables(event, true);
        if (
          hasDataAttribute(event, 'data-capture-source') &&
          !hasDataAttribute(event, 'data-non-capture-source')
        ) {
          if (options.onCaptureStart) {
            options.onCaptureStart({ area: area.current, mouseEvent: event });
          }
          start.current.set(event.pageX, event.pageY);
          end.current.set(event.pageX, event.pageY);
          isDragging.current = true;
        }
      };

      const handleMouseUp = (event: MouseEvent) => {
        if (isDragging.current) {
          isDragging.current = false;
          area.current.set(start.current, end.current);
  
          if (options.onCaptureEnd) {
            options.onCaptureEnd({ area: area.current, mouseEvent: event });
          }
          start.current.set(0, 0);
          start.current.set(0, 0);

          capturables.current.forEach((element) => {
            element.setAttribute('data-captured', 'false');
          });
        }
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (isDragging.current) {
          end.current.set(event.pageX, event.pageY);
          area.current.set(start.current, end.current);
          shouldDispatch.current = true;
          notifyCapturables(event);
          lastEvent.current = event;
        }
      };

      document.addEventListener('mousedown', handleMouseDown);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('mousemove', handleMouseMove);

      let animation: number;

      const animate = () => {
        if (isDragging.current) {
          area.current.set(start.current, end.current);
          if (options.onCapture) {
            options.onCapture({
              area: area.current,
              updated: shouldDispatch.current,
              mouseEvent: lastEvent.current!,
            });
          }
          shouldDispatch.current = false;
        }

        animation = requestAnimationFrame(animate);
      };

      animation = requestAnimationFrame(animate);

      return () => {
        cancelAnimationFrame(animation);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }
  }, [ref, rect]);

  useEffect(() => {
    cancel();
  }, [rect]);

  return { ref, cancel };
}

export function useNonCaptureSource<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.setAttribute('data-non-capture-source', 'true');
    }
  }, [ref]);

  return ref;
}

export function useCaptureTarget<T extends HTMLElement>(
  id: string,
  onCaptureChange: (event: CustomEvent<CaptureChangeEvent>) => void
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const handleCaptureChange = (event: CustomEvent<CaptureChangeEvent>) => {
      onCaptureChange(event);
    };

    if (ref.current) {
      ref.current.setAttribute('data-capture-target', id);
      ref.current.addEventListener('capture-change', handleCaptureChange as EventListener);
    }

    return () => {
      if (ref.current) {
        ref.current.removeEventListener('capture-change', handleCaptureChange as EventListener);
      }
    };
  }, [ref]);

  return ref;
}

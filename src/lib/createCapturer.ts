import { Area, Vector2D } from './math';
import { getScroll, hasDataAttribute } from './util';

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

export function createCapturer<T extends HTMLElement>(element: T) {
  let isDragging = false;
  let area = new Area(new Vector2D(0, 0), new Vector2D(0, 0));
  let start = new Vector2D(0, 0);
  let end = new Vector2D(0, 0);
  let shouldDispatch = false;
  let lastEvent: MouseEvent | null = null;

  element.setAttribute('data-capture-source', 'true');

  let capturables: HTMLElement[] = Array.from(element.querySelectorAll(`[data-capture-target]`));

  capturables.forEach((element) => {
    element.setAttribute('data-captured', 'false');
  });

  const cancel = () => {
    isDragging = false;
    shouldDispatch = false;
  };

  const notifyCapturables = (event: MouseEvent, bypass = false) => {
    capturables.forEach((element) => {
      const id = element.getAttribute('data-capture-target');
      const captured = !!element.getAttribute('data-captured');

      if (bypass) {
        element.dispatchEvent(
          new CustomEvent('capture-state-change', {
            detail: { area, captured: false, id, mouseEvent: event },
          })
        );
        return;
      }

      const intersects = Area.fromElement(element, getScroll(element)).intersects(area);

      if (intersects && captured) {
        element.dispatchEvent(
          new CustomEvent('capture-state-change', {
            detail: { area, captured: true, id, mouseEvent: event },
          })
        );
        element.setAttribute('data-captured', 'true');
      } else {
        element.dispatchEvent(
          new CustomEvent('capture-state-change', {
            detail: { area, captured: false, id, mouseEvent: event },
          })
        );
        element.setAttribute('data-captured', 'false');
      }
    });
  };

  const handleMouseDown = (event: MouseEvent) => {
    notifyCapturables(event, true);
    if (
      hasDataAttribute(event, 'data-capture-source') &&
      !hasDataAttribute(event, 'data-non-capture-source')
    ) {
      element.dispatchEvent(
        new CustomEvent('capture-start', {
          detail: { area: area, mouseEvent: event },
        })
      );

      start.set(event.pageX, event.pageY);
      end.set(event.pageX, event.pageY);
      isDragging = true;
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDragging) {
      end.set(event.pageX, event.pageY);
      area.set(start, end);
      shouldDispatch = true;
      notifyCapturables(event);
      lastEvent = event;
    }
  };

  const handleMouseUp = (event: MouseEvent) => {
    if (isDragging) {
      isDragging = false;
      area.set(start, end);

      element.dispatchEvent(
        new CustomEvent('capture-end', { detail: { area: area, mouseEvent: event } })
      );
      start.set(0, 0);
      start.set(0, 0);

      capturables.forEach((element) => {
        element.setAttribute('data-captured', 'false');
      });
    }
  };

  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mousemove', handleMouseMove);

  let animation: number;

  const animate = () => {
    if (isDragging) {
      area.set(start, end);
      element.dispatchEvent(
        new CustomEvent('capture-tick', {
          detail: {
            area: area,
            updated: shouldDispatch,
            mouseEvent: lastEvent!,
          },
        })
      );
      shouldDispatch = false;
    }

    animation = requestAnimationFrame(animate);
  };

  animation = requestAnimationFrame(animate);

  return {
    unsubscribe: () => {
      cancelAnimationFrame(animation);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
    },
    cancel,
  };
}

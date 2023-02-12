import { Area, Vector2D } from './math';
import { animate, getScroll, hasDataAttribute } from './util';

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

export interface CaptureOptions {
  manuelCommit?: boolean;
}

export function createCapturer<T extends HTMLElement>(element: T, options: CaptureOptions) {
  let isDragging = false;
  let area = new Area(new Vector2D(0, 0), new Vector2D(0, 0));
  let start = new Vector2D(0, 0);
  let end = new Vector2D(0, 0);
  let shouldDispatch = false;
  let lastEvent: MouseEvent | null = null;

  element.setAttribute('data-capture-source', 'true');

  let capturables: Array<HTMLElement> = [];

  Array.from(element.querySelectorAll(`[data-capture-target]`)).forEach((element) => {
    element.setAttribute('data-captured', 'false');
    capturables.push(element as HTMLElement);
  });

  let visibleCapturables: Array<{ id: string; element: HTMLElement; area: Area }> = [];

  const observer = new IntersectionObserver(
    (entries) => {
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const element = entry.target as HTMLElement;
        const data = {
          id: element.getAttribute('data-capture-target')!,
          element,
          area: Area.fromElement(element as HTMLElement, getScroll(element as HTMLElement)),
        };

        if (entry.isIntersecting) {
          visibleCapturables.push(data);
        } else {
          visibleCapturables = visibleCapturables.filter((capturable) => capturable.id !== data.id);
        }
      }
    },
    {
      threshold: 0.1,
    }
  );

  for (let i = 0; i < capturables.length; i++) {
    observer.observe(capturables[i]);
  }

  function changeCaptureState(state: boolean, element: HTMLElement, id: string, event: MouseEvent) {
    element.dispatchEvent(
      new CustomEvent('capture-state-change', {
        detail: { area, captured: state, id, mouseEvent: event },
      })
    );
    element.setAttribute('data-captured', state ? 'true' : 'false');
  }

  const notifyCapturables = (event: MouseEvent, bypass = false) => {
    if (bypass) {
      for (let i = 0; i < capturables.length; i++) {
        const element = capturables[i];
        const id = element.getAttribute('data-capture-target')!;
        changeCaptureState(false, element, id, event);
      }
      return;
    }

    for (let i = 0; i < visibleCapturables.length; i++) {
      const { element, area: capturableArea, id } = visibleCapturables[i];

      const captured = !!element.getAttribute('data-captured');
      const intersects = capturableArea.intersects(area);

      if (intersects && captured) {
        changeCaptureState(true, element, id, event);
      } else {
        changeCaptureState(false, element, id, event);
      }
    }
  };

  const handleMouseDown = (event: MouseEvent) => {
    if (
      event.button === 0 &&
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
      notifyCapturables(event, true);
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
      end.set(0, 0);

      if (options.manuelCommit !== true) {
        commit(event);
      }
    }
  };

  const handleCaptureCommit = () => {
    commit(lastEvent!);
  };

  element.addEventListener('capture-commit', handleCaptureCommit);
  document.addEventListener('mousedown', handleMouseDown);
  document.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('mousemove', handleMouseMove);

  let animation: number;

  animate((id: number) => {
    animation = id;
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
  });

  function commit(event: MouseEvent) {
    const invisibleCapturables = capturables.filter(
      (capturable) => !visibleCapturables.find((data) => data.id === capturable.id)
    );

    for (let i = 0; i < invisibleCapturables.length; i++) {
      const element = invisibleCapturables[i];
      const id = element.getAttribute('data-capture-target')!;
      const captured = !!element.getAttribute('data-captured');

      if (captured) {
        changeCaptureState(false, element, id, event);
      }
    }

    notifyCapturables(event, true);
  }

  return {
    destroy: () => {
      cancelAnimationFrame(animation);
      element.removeEventListener('capture-commit', handleCaptureCommit);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousemove', handleMouseMove);
      element.removeAttribute('data-capture-source');
      for (let i = 0; i < capturables.length; i++) {
        capturables[i].removeAttribute('data-captured');
      }
      capturables = [];
      lastEvent = null;
      observer.disconnect();
    },
    cancel: () => {
      isDragging = false;
      shouldDispatch = false;
    },
  };
}

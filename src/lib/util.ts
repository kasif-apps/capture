import { Vector2D } from './math';

export function hasDataAttribute(event: MouseEvent, attribute: string) {
  const eventPath = event
    .composedPath()
    .filter((element) => element instanceof HTMLElement) as HTMLElement[];
  const result = eventPath
    .map((element: HTMLElement) => !!element.getAttribute(attribute))
    .includes(true);

  return result;
}

export function getScroll(element: HTMLElement): Vector2D {
  let currentElement: HTMLElement | null = element;
  let result = { x: 0, y: 0 };

  while (currentElement && currentElement instanceof HTMLElement) {
    result.y += currentElement.scrollTop || 0;
    result.x += currentElement.scrollLeft || 0;
    currentElement = currentElement.parentElement;
  }

  return new Vector2D(result.x, result.y);
}

export function getCapturedTargets(source?: HTMLElement): { element: HTMLElement; id: string }[] {
  const element = source || document.body;

  const result = Array.from(element.querySelectorAll('[data-captured="true"]')).filter(
    (element) => element instanceof HTMLElement
  ) as HTMLElement[];

  return result.map((element) => ({ element, id: element.getAttribute('data-capture-target')! }));
}

export function getScreenRefreshRate(
  callback: (fps: number, stampCollection: number[]) => void,
  runIndefinitely: boolean
) {
  let requestId: number | null = null;
  let callbackTriggered = false;
  runIndefinitely = runIndefinitely || false;

  let DOMHighResTimeStampCollection: number[] = [];

  let triggerAnimation = function (DOMHighResTimeStamp: number) {
    DOMHighResTimeStampCollection.unshift(DOMHighResTimeStamp);

    if (DOMHighResTimeStampCollection.length > 10) {
      let t0 = DOMHighResTimeStampCollection.pop()!;
      let fps = Math.floor((1000 * 10) / (DOMHighResTimeStamp - t0));

      if (!callbackTriggered) {
        callback.call(undefined, fps, DOMHighResTimeStampCollection);
      }

      if (runIndefinitely) {
        callbackTriggered = false;
      } else {
        callbackTriggered = true;
      }
    }

    requestId = window.requestAnimationFrame(triggerAnimation);
  };

  window.requestAnimationFrame(triggerAnimation);

  if (!runIndefinitely) {
    window.setTimeout(function () {
      requestId && window.cancelAnimationFrame(requestId);
      requestId = null;
    }, 500);
  }
}

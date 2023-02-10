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

export function generateId() {
  return `capture-${Math.random().toString(36).substr(2, 9)}`;
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

export function getCapturedTargets(): { element: HTMLElement; id: string }[] {
  const result = Array.from(document.querySelectorAll('[data-captured="true"]')).filter(
    (element) => element instanceof HTMLElement
  ) as HTMLElement[];

  return result.map((element) => ({ element, id: element.getAttribute('data-capture-target')! }));
}

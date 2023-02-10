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

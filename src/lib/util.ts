export function hasDataAttribute(event: MouseEvent, attribute: string) {
  const eventPath = event
    .composedPath()
    .filter((element) => element instanceof HTMLElement) as HTMLElement[];
  const result = eventPath
    .map((element: HTMLElement) => !!element.getAttribute(attribute))
    .includes(true);

  return result;
}

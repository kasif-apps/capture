# Capture - 2D field capturing utilities.

## Introduction

Capture basically provides you the minimal primitives to perform field capture like in a desktop environment. Capture is mostly based on custom events and math primitives like `Vector` and `Area`.

## Install

Using npm

```bash
npm i @kasif-apps/capture
```

Using yarn

```bash
yarn add @kasif-apps/capture
```

Using pnpm

```bash
pnpm i @kasif-apps/capture
```

## Basic Usage

Use the `createCapturer` function with an HTML element and start capturing. This function will return two methods:

- `unsubscribe` - to unmount the capturer from the node
- `cancel` - to cancel any capture process remotely

```typescript
import { createCapturer } from '@kasif-apps/capture';

const wrapper = document.createElement('div');
const { unsubscribe, cancel } = createCapturer(wrapper);
```

With only the capturer attached like this, you won't see anything. You might want to display a quad that is the capture area but this library is headless so you need to do it by yourself. I can only give you a hint how to do it.

You can use a canvas or a good old `div` to draw your area, it is up to you. But to do it, you are going to want to use the `capture-tick` event. This is event fires every frame if the capturing process has started. But don't worry, it comes with an `updated` field that may reduce the event call to a more managable count.

Let's create a `div` that displays an area:

```typescript
const field = document.createElement('div');
// do some initial styling
field.style = 'position: absolute;background-color: #102372;opacity: 0.3;z-index: 99;';

// using the wrapper from the previous example
wrapper.addEventListener('capture-tick', (event: CustomEvent<CaptrueTickEvent>) => {
  // let's not run this too many times
  if (event.detail.updated) {
    const { area } = event.detail;
    field.style.left = `${area.topLeft.x}px`;
    field.style.top = `${area.topLeft.y}px`;
    field.style.width = `${area.width}px`;
    field.style.height = `${area.height}px`;
  }
} as EventListener);
```

Now you can see the capture field, but there is no item to capture. Let's create some capturable elements.

```typescript
let p = document.createElement('p');

// append it to parent
wrapper.appendChild(p);

// to be able to make it capturable, we will provide a data attribute with a unique id
p.setAttribute('data-capture-target', 'capture-target-p');

// now you can listen to the changes of the capture state
p.addEventListener("capture-state-change", (event: CustomEvent<CaptureChangeEvent>) => {
  // you can do anything here
  if (event.detail.captured) {
    p.style.color = 'red';
  }else {
    p.style.color = 'initial';
  }
} as EventListener);
```

> Be sure to append every child before you create the capturer. If you have a dynamic system, recreate a capturer after appending new elements and destroy the old one.

## API

### Functions

#### `createCapturer`

Used to create a capture source.

_Signature_

```typescript
declare function createCapturer<T extends HTMLElement>(
  element: T
): {
  unsubscribe: () => void;
  cancel: () => void;
};
```

#### `getCapturedTargets`

Used to get any captured targets at any point in time. It comes in handy with `capture-end` event listener. It takes an optional target source, if you have multiple target sources in a page it seperates the captured targets.

_Signature_

```typescript
declare function getCapturedTargets(source?: HTMLElement): {
  element: HTMLElement;
  id: string;
}[];
```

### Classes

#### `Vector2D`

Helper class for dealing with 2 dimensional vectors.

_Signature_

```typescript
declare class Vector2D {
  x: number;
  y: number;
  constructor(x: number, y: number);
  add(v: Vector2D): void;
  subtract(v: Vector2D): void;
  multiply(v: Vector2D): void;
  divide(v: Vector2D): void;
  set(x: number, y: number): void;
  static add(v1: Vector2D, v2: Vector2D): Vector2D;
  static subtract(v1: Vector2D, v2: Vector2D): Vector2D;
  static multiply(v1: Vector2D, v2: Vector2D): Vector2D;
  static divide(v1: Vector2D, v2: Vector2D): Vector2D;
  static distance(v1: Vector2D, v2: Vector2D): number;
}
```

#### `Area`

Helper class for dealing with 2 dimensional areas

_Signature_

```typescript
declare class Area {
  start: Vector2D;
  end: Vector2D;
  constructor(start: Vector2D, end: Vector2D);
  set(start: Vector2D, end: Vector2D): void;
  is(area: Area): boolean;
  get width(): number;
  get height(): number;
  get center(): Vector2D;
  get area(): number;
  get topLeft(): Vector2D;
  get topRight(): Vector2D;
  get bottomLeft(): Vector2D;
  get bottomRight(): Vector2D;
  get points(): [Vector2D, Vector2D, Vector2D, Vector2D];
  intersects(area: Area): boolean;

  static fromElement(element: HTMLElement, buffer?: Vector2D): Area;
}
```

### EventListeners

#### `capture-tick`

This event is dispatched upon the capture source element. It is fired every frame when the capture starts. The event has the `CustomEvent<CaptureTickEvent>` signature where the `CaptureTickEvent` is:

```typescript
interface CaptureTickEvent {
  area: Area;
  updated: boolean;
  mouseEvent: MouseEvent;
}
```

#### `capture-start`

This event is dispatched upon the capture source element. It is fired once when the capture starts. The event has the `CustomEvent<CaptureEdgeEvent>` signature where the `CaptureEdgeEvent` is:

```typescript
interface CaptureEdgeEvent {
  area: Area;
  mouseEvent: MouseEvent;
}
```

#### `capture-end`

This event is dispatched upon the capture source element. It is fired once when the capture ends. At this point the captured targets has not been discarded so you can catch them. The event has the `CustomEvent<CaptureEdgeEvent>` signature where the `CaptureEdgeEvent` is:

```typescript
interface CaptureEdgeEvent {
  area: Area;
  mouseEvent: MouseEvent;
}
```

#### `capture-state-change`

This event is dispatched upon an element that has the `data-capture-target` attribute before capture creation. It is fired every frame when the capture starts. The event has the `CustomEvent<CaptureChangeEvent>` signature where the `CaptureChangeEvent` is:

```typescript
interface CaptureChangeEvent {
  area: Area;
  captured: boolean;
  id: string; // provided id to the 'data-capture-target' attribute
  mouseEvent: MouseEvent;
}
```

### Data Attributes

#### `data-capture-target`

You can provide this data attribute to any HTML element to make them capturable. You need to make sure that in single a capture source, every target has a unique id.

eg:

```html
<div data-capture-target="1"></div>
<p data-capture-target="2"></p>
<button data-capture-target="3"></button>
```

#### `data-non-capture-source`

You may want to set some areas where the user **cannot** start a capture that is inside the capture source. You can pass the `data-non-capture-source` attribute to disable the initiation of a capture inside a certain area.

```html
<div data-capture-target="1"></div>
<p data-capture-target="2"></p>
<div data-non-capture-source>Non capture source</div>
<button data-capture-target="3"></button>
```

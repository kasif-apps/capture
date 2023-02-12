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

#### `getCapturedTargets`

### Classes

#### `Vector2D`

#### `Area`

### EventListeners

### Data Attributes
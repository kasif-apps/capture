import React from 'react';
import { useCallback } from 'react';
import { useRef, useState } from 'react';

import {
  CaptureTarget,
  CaptureEdgeEvent,
  CaptureTickEvent,
  useCapture,
  useCaptureTarget,
  useNonCaptureSource,
  getCapturedTargets,
} from '../lib/index';

import styles from './Capture.module.css';

export const Capture: React.FC<{ type: 'basic' | 'grid' }> = (props) => {
  if (props.type === 'basic') {
    return <BasicCapture />;
  } else {
    return <GridCapture />;
  }
};

export const BasicCapture: React.FC<{}> = () => {
  const [captured, setCaptured] = useState(false);
  const { ref: captureFieldRef, onCapture, onCaptureEnd } = useCaptureField();
  const someRef = useRef(null);

  const { ref } = useCapture<HTMLDivElement>({
    onCapture,
    onCaptureEnd,
  });
  const nonCapture = useNonCaptureSource<HTMLDivElement>();
  const captureTarget = useCaptureTarget<HTMLParagraphElement>('10', (e) => {
    if (e.detail.captured) {
      captureTarget.current?.classList.add(styles.captured);
    } else {
      captureTarget.current?.classList.remove(styles.captured);
    }
  });

  return (
    <>
      <div className={[styles.wrapper, styles.vertical].join(' ')} ref={ref}>
        <h1>Capture Source</h1>
        <p ref={captureTarget}>Capturable element</p>
        <p>Non capturable element</p>
        <div ref={nonCapture} className={styles.box}>
          Non capture source
        </div>
        <CaptureTarget
          onCaptureStateChange={(event) => {
            setCaptured(event.detail.captured);
          }}
        >
          <div ref={someRef} className={captured ? styles.captured : ''}>
            <p>Capturable element</p>
            <b>hi</b>
          </div>
        </CaptureTarget>
        <div ref={captureFieldRef} className={styles.captureField}></div>
      </div>
      <p data-capture-target="30">Outside capture</p>
    </>
  );
};

export const GridCapture: React.FC<{}> = () => {
  const { ref: captureFieldRef, onCapture, onCaptureEnd } = useCaptureField();
  const [storedItems, setStoredItems] = useState<string[]>([]);
  const shouldKeep = useRef(false);

  const handleCaptureStart = useCallback((event: CustomEvent<CaptureEdgeEvent>) => {
    if (event.detail.mouseEvent.shiftKey) {
      shouldKeep.current = true;
    }

    if (!shouldKeep.current) {
      setStoredItems([]);
    }
  }, []);

  const handleCaptureEnd = useCallback(() => {
    onCaptureEnd();

    const targets = getCapturedTargets().map((t) => t.id);

    if (shouldKeep.current) {
      setStoredItems((storedItems) => [...storedItems, ...targets]);
    } else {
      setStoredItems(targets);
    }

    shouldKeep.current = false;
  }, []);

  const { ref } = useCapture<HTMLDivElement>({
    onCapture,
    onCaptureEnd: handleCaptureEnd,
    onCaptureStart: handleCaptureStart,
  });

  return (
    <div className={[styles.wrapper, styles.resizeBoth].join(' ')} ref={ref}>
      <h1>Capture Source</h1>
      <div className={styles.itemsWrapper}>
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <CaptureTarget id={`capture-target-${i}`} key={i}>
              <div
                data-non-capture-source
                role="button"
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (storedItems.includes(`capture-target-${i}`)) {
                      setStoredItems((storedItems) =>
                        storedItems.filter((item) => item !== `capture-target-${i}`)
                      );
                    } else {
                      setStoredItems((storedItems) =>
                        Array.from(new Set([...storedItems, `capture-target-${i}`]))
                      );
                    }
                  } else {
                    setStoredItems([`capture-target-${i}`]);
                  }
                }}
                className={[
                  styles.item,
                  storedItems.includes(`capture-target-${i}`) ? styles.selected : '',
                ].join(' ')}
              >
                <p>Item {i}</p>
              </div>
            </CaptureTarget>
          ))}
      </div>
      <div ref={captureFieldRef} className={styles.captureField}></div>
    </div>
  );
};

function useCaptureField() {
  const ref = useRef<HTMLDivElement>(null);

  const onCapture = useCallback(
    (event: CustomEvent<CaptureTickEvent>) => {
      if (ref.current && event.detail.updated) {
        const { area } = event.detail;
        ref.current.style.left = `${area.topLeft.x}px`;
        ref.current.style.top = `${area.topLeft.y}px`;
        ref.current.style.width = `${area.width}px`;
        ref.current.style.height = `${area.height}px`;
      }
    },
    [ref.current]
  );

  const onCaptureEnd = useCallback(() => {
    if (ref.current) {
      ref.current.style.left = '0px';
      ref.current.style.top = '0px';
      ref.current.style.width = '0px';
      ref.current.style.height = '0px';
    }
  }, [ref.current]);

  return {
    ref: ref,
    onCapture: onCapture,
    onCaptureEnd: onCaptureEnd,
  };
}

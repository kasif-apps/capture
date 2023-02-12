import React, { useRef, useState, useCallback, useEffect } from 'react';

import { CaptureEdgeEvent, CaptureTickEvent, getCapturedTargets } from '../lib/index';

import styles from './Capture.module.css';
import { useCapture, CaptureTarget } from './captureReact';

export const Capture: React.FC<{ type: 'basic' | 'grid' | 'scroll' | 'load-test' }> = (props) => {
  switch (props.type) {
    case 'basic':
      return <BasicCapture />;
    case 'grid':
      return <GridCapture />;
    case 'scroll':
      return <ScrollCapture />;
    case 'load-test':
      return <LoadTestCapture />;
    default:
      return <BasicCapture />;
  }
};

export const BasicCapture: React.FC<{}> = () => {
  const [captured, setCaptured] = useState(false);
  const { ref: captureFieldRef, onCaptureTick, onCaptureEnd } = useCaptureField();

  const { ref } = useCapture<HTMLDivElement>({
    onCaptureTick,
    onCaptureEnd,
  });

  return (
    <>
      <div className={[styles.wrapper, styles.vertical].join(' ')} ref={ref}>
        <h1>Capture Source</h1>
        <CaptureTarget id="10">
          <p className={styles.capturable}>Capturable element</p>
        </CaptureTarget>
        <p>Non capturable element</p>
        <div data-non-capture-source className={styles.box}>
          Non capture source
        </div>
        <CaptureTarget
          id="10"
          onCaptureStateChange={(event) => {
            setCaptured(event.detail.captured);
          }}
        >
          <div data-capture-target className={captured ? styles.captured : ''}>
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
  const { ref: captureFieldRef, onCaptureTick, onCaptureEnd } = useCaptureField();
  const [storedItems, setStoredItems] = useState<string[]>([]);
  const shouldKeep = useRef(false);

  const getID = (index: number) => `capture-target-${index}`;

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
    onCaptureTick,
    onCaptureEnd: handleCaptureEnd,
    onCaptureStart: handleCaptureStart,
    constrain: true,
  });

  return (
    <div className={[styles.wrapper, styles.resizeBoth].join(' ')} ref={ref}>
      <h1>Capture Source</h1>
      <div className={styles.itemsWrapper}>
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <CaptureTarget id={getID(i)} key={i}>
              <div
                data-non-capture-source
                role="button"
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (storedItems.includes(getID(i))) {
                      setStoredItems((storedItems) =>
                        storedItems.filter((item) => item !== getID(i))
                      );
                    } else {
                      setStoredItems((storedItems) =>
                        Array.from(new Set([...storedItems, getID(i)]))
                      );
                    }
                  } else {
                    setStoredItems([getID(i)]);
                  }
                }}
                className={[
                  styles.item,
                  storedItems.includes(getID(i)) ? styles.selected : '',
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

export const ScrollCapture: React.FC<{}> = () => {
  const { ref: captureFieldRef, onCaptureTick, onCaptureEnd } = useCaptureField();
  const [storedItems, setStoredItems] = useState<string[]>([]);
  const shouldKeep = useRef(false);

  const getID = (index: number) => `capture-target-${index}`;

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
    onCaptureTick,
    onCaptureEnd: handleCaptureEnd,
    onCaptureStart: handleCaptureStart,
  });

  return (
    <div className={[styles.wrapper, styles.resizeBoth].join(' ')} ref={ref}>
      <h1>Capture Source</h1>
      <div className={[styles.itemsWrapper, styles.scroll].join(' ')}>
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <CaptureTarget id={getID(i)} key={i}>
              <div
                data-non-capture-source
                role="button"
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (storedItems.includes(getID(i))) {
                      setStoredItems((storedItems) =>
                        storedItems.filter((item) => item !== getID(i))
                      );
                    } else {
                      setStoredItems((storedItems) =>
                        Array.from(new Set([...storedItems, getID(i)]))
                      );
                    }
                  } else {
                    setStoredItems([getID(i)]);
                  }
                }}
                className={[
                  styles.item,
                  storedItems.includes(getID(i)) ? styles.selected : '',
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

export const LoadTestCapture: React.FC<{}> = () => {
  const { ref: captureFieldRef, onCaptureTick, onCaptureEnd } = useCaptureField();
  const [storedItems, setStoredItems] = useState<string[]>([]);
  const shouldKeep = useRef(false);

  const getID = (index: number) => `capture-target-${index}`;

  const handleCaptureStart = useCallback((event: CustomEvent<CaptureEdgeEvent>) => {
    if (event.detail.mouseEvent.shiftKey) {
      shouldKeep.current = true;
    }

    if (!shouldKeep.current) {
      setStoredItems([]);
    }
  }, []);

  const handleCaptureEnd = useCallback((e: CustomEvent<CaptureEdgeEvent>) => {
    onCaptureEnd();

    const targets = getCapturedTargets().map((t) => t.id);

    if (shouldKeep.current) {
      setStoredItems((storedItems) => [...storedItems, ...targets]);
    } else {
      setStoredItems(targets);
    }

    shouldKeep.current = false;
  }, []);
  
  useEffect(() => {
    ref.current?.dispatchEvent(new CustomEvent('capture-commit'));
  }, [storedItems]);

  const { ref } = useCapture<HTMLDivElement>({
    onCaptureTick,
    onCaptureEnd: handleCaptureEnd,
    onCaptureStart: handleCaptureStart,
    manuelCommit: true,
  });

  return (
    <div className={[styles.wrapper, styles.resizeBoth].join(' ')} ref={ref}>
      <h1>Capture Source</h1>
      <div className={styles.itemsWrapper}>
        {Array(1000)
          .fill(0)
          .map((_, i) => (
            <CaptureTarget id={getID(i)} key={i}>
              <div
                data-non-capture-source
                role="button"
                onClick={(e) => {
                  if (e.shiftKey) {
                    if (storedItems.includes(getID(i))) {
                      setStoredItems((storedItems) =>
                        storedItems.filter((item) => item !== getID(i))
                      );
                    } else {
                      setStoredItems((storedItems) =>
                        Array.from(new Set([...storedItems, getID(i)]))
                      );
                    }
                  } else {
                    setStoredItems([getID(i)]);
                  }
                }}
                className={[
                  styles.item,
                  storedItems.includes(getID(i)) ? styles.selected : '',
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

  const onCaptureTick = useCallback(
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
    onCaptureTick: onCaptureTick,
    onCaptureEnd: onCaptureEnd,
  };
}

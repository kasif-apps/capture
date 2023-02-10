import { useRef, useState } from 'react';
import { CaptureTarget } from '../lib/CaptureTarget';
import { Area } from '../lib/math';
import { useCapture, useCaptureTarget, useNonCaptureSource } from '../lib/useCapture';
import styles from './Capture.module.css';

export const Capture: React.FC<{ type: 'basic' | 'mutltiple' }> = (props) => {
  if (props.type === 'basic') {
    return <BasicCapture />;
  } else {
    return <MultipleCapture />;
  }
};

export const BasicCapture: React.FC<{}> = () => {
  const [captured, setCaptured] = useState(false);
  const { ref: captureFieldRef, onCapture, onCaptureEnd } = useCaptureField();

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
      <div
        onResize={(e) => console.log(e)}
        className={[styles.wrapper, styles.vertical].join(' ')}
        ref={ref}
      >
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
          <div className={captured ? styles.captured : ''}>
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

export const MultipleCapture: React.FC<{}> = () => {
  const { ref: captureFieldRef, onCapture, onCaptureEnd } = useCaptureField();
  const { ref } = useCapture<HTMLDivElement>({ onCapture, onCaptureEnd });
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  return (
    <div
      onResize={(e) => console.log(e)}
      className={[styles.wrapper, styles.resizeBoth].join(' ')}
      ref={ref}
    >
      <h1>Capture Source</h1>
      <div className={styles.itemsWrapper}>
        {Array(50)
          .fill(0)
          .map((_, i) => (
            <CaptureTarget
              id={`capture-target-${i}`}
              onCaptureStateChange={(e) => {
                if (e.detail.captured) {
                  setSelectedItems((prev) => Array.from(new Set([...prev, e.detail.id])));
                } else {
                  setSelectedItems((prev) => prev.filter((id) => id !== e.detail.id));
                }
              }}
              key={i}
            >
              <div
                data-non-capture-source
                className={[
                  styles.item,
                  selectedItems.includes(`capture-target-${i}`) ? styles.selectedItem : '',
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

  const onCapture = (area: Area, updated: boolean) => {
    if (ref.current && updated) {
      ref.current.style.left = `${area.topLeft.x}px`;
      ref.current.style.top = `${area.topLeft.y}px`;
      ref.current.style.width = `${area.width}px`;
      ref.current.style.height = `${area.height}px`;
    }
  };

  const onCaptureEnd = () => {
    if (ref.current) {
      ref.current.style.left = '0px';
      ref.current.style.top = '0px';
      ref.current.style.width = '0px';
      ref.current.style.height = '0px';
    }
  };

  return {
    ref: ref,
    onCapture: onCapture,
    onCaptureEnd: onCaptureEnd,
  };
}

import { useRef } from 'react';
import { Area } from '../lib/math';
import { useCapture, useCaptureTarget, useNonCaptureSource } from '../lib/useCapture';
import styles from './Capture.module.css';

export const Capture: React.FC<{}> = () => {
  const handleCapture = (area: Area, updated: boolean) => {
    if (captureFieldRef.current && updated) {
      captureFieldRef.current.style.left = `${area.topLeft.x}px`;
      captureFieldRef.current.style.top = `${area.topLeft.y}px`;
      captureFieldRef.current.style.width = `${area.width}px`;
      captureFieldRef.current.style.height = `${area.height}px`;
    }
  };

  const handleCaptureEnd = () => {
    if (captureFieldRef.current) {
      captureFieldRef.current.style.left = '0px';
      captureFieldRef.current.style.top = '0px';
      captureFieldRef.current.style.width = '0px';
      captureFieldRef.current.style.height = '0px';
    }
  };

  const { ref } = useCapture<HTMLDivElement>({
    onCapture: handleCapture,
    onCaptureEnd: handleCaptureEnd,
  });
  const nonCapture = useNonCaptureSource<HTMLDivElement>();
  const captureTarget = useCaptureTarget<HTMLParagraphElement>('10', (captured) => {
    if (captured) {
      captureTarget.current?.classList.add(styles.captured);
    }else {
      captureTarget.current?.classList.remove(styles.captured);
    }
  });
  const captureFieldRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div onResize={(e) => console.log(e)} className={styles.wrapper} ref={ref}>
        <h1>Capture Field</h1>
        <p ref={captureTarget}>Capturable element</p>
        <p>Non capturable element</p>
        <div ref={nonCapture} className={styles.box}>
          Non capture source
        </div>
        <p data-capture-target="20">Capturable element</p>
        <div ref={captureFieldRef} className={styles.captureField}></div>
      </div>
      <p data-capture-target="30">Outside capture</p>
    </>
  );
};

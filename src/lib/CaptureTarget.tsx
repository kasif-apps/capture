import React from 'react';
import { CaptureChangeEvent, useCaptureTarget } from './useCapture';
import { generateId } from './util';

export function CaptureTarget({
  id,
  children,
  onCaptureStateChange,
}: {
  id?: string;
  children: React.ReactElement;
  onCaptureStateChange?: (event: CustomEvent<CaptureChangeEvent>) => void;
}) {
  const captureTarget = useCaptureTarget<HTMLParagraphElement>(
    id || generateId(),
    (e: CustomEvent<CaptureChangeEvent>) => {
      onCaptureStateChange && onCaptureStateChange(e);
    }
  );

  return <div ref={captureTarget}>{children}</div>;
}

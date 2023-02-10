import React from 'react';
import { CaptureChangeEvent, useCaptureTarget } from './useCapture';
import { useMergedRef } from './useMergedRef';
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
  const captureTarget = useCaptureTarget<any>(
    id || generateId(),
    (e: CustomEvent<CaptureChangeEvent>) => {
      onCaptureStateChange && onCaptureStateChange(e);
    }
  );

  // @ts-ignore
  const mergedRef = useMergedRef(captureTarget, children.ref);

  return React.cloneElement(children, { ref: mergedRef });
}

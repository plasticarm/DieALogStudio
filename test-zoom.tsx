import React, { useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

export default function TestZoom() {
  return (
    <TransformWrapper>
      {({ zoomToElement }) => (
        <TransformComponent>
          <div style={{ width: 800, height: 600, position: 'relative' }}>
            <div id="target" style={{ position: 'absolute', left: 100, top: 100, width: 200, height: 200, background: 'red' }} />
            <button onClick={() => zoomToElement('target', 2, 500)}>Zoom</button>
          </div>
        </TransformComponent>
      )}
    </TransformWrapper>
  );
}

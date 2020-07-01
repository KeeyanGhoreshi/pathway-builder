import React, { FC, ReactNode, memo, useEffect, useRef } from 'react';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';

import styles from './DagreGraph.module.scss';
import { useGraphDimensions } from './GraphProvider';

interface GraphWrapperProps {
  children: ReactNode | ReactNode[];
}

const GraphWrapper: FC<GraphWrapperProps> = ({ children }) => {
  const graphRef = useRef<HTMLDivElement>(null);
  const { setWidth } = useGraphDimensions();

  useEffect(() => {
    const graphElement = graphRef.current;
    if (graphElement?.parentElement) {
      setWidth(graphElement.parentElement.clientWidth);
      const sensor = new ResizeSensor(graphElement.parentElement, () => {
        setWidth(graphRef.current?.parentElement?.clientWidth ?? 0);
      });
      return (): void => {
        sensor.detach();
      };
    }
  }, [graphRef, setWidth]);

  return (
    <div className={styles.root} ref={graphRef}>
      {children}
    </div>
  );
};

export default memo(GraphWrapper);

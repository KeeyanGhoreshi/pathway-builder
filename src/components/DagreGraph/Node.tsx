import React, { FC, memo, useCallback, useEffect, useRef } from 'react';
import clsx from 'clsx';

import { GuidanceState, BranchState, State } from 'pathways-model';
import styles from './DagreGraph.module.scss';
import { useGraphProvider } from './GraphProvider';

interface NodeProps {
  nodeKey: string;
  pathwayState: GuidanceState | BranchState | State;
  isActionable: boolean;
  isExpanded: boolean;
  onClick?: (nodeName: string) => void;
}

const Node: FC<NodeProps> = ({ nodeKey, pathwayState, isActionable, isExpanded, onClick }) => {
  const onClickHandler = useCallback(() => {
    if (onClick) onClick(nodeKey);
  }, [onClick, nodeKey]);
  const nodeRef = useRef<HTMLDivElement>(null);
  const { graph } = useGraphProvider();

  const { label } = pathwayState;

  useEffect(() => {
    const width = nodeRef.current?.clientWidth;
    const height = Array.from(nodeRef.current?.children || []).reduce(
      (acc, child) => acc + child.clientHeight,
      0
    );
    graph.setNode(nodeKey, {
      label,
      width,
      height
    });
    return (): void => {
      graph.removeNode(nodeKey);
    };
  }, [graph, nodeKey, nodeRef, label]);

  return (
    <div
      className={clsx(
        styles.node,
        isExpanded && styles.expanded,
        isActionable && styles.actionable
      )}
      ref={nodeRef}
    >
      <div className={clsx(styles.nodeTitle, onClick && styles.clickable)} onClick={onClickHandler}>
        <div className={styles.iconAndLabel}>{label}</div>
      </div>
      {isExpanded && (
        <div
          className={clsx(
            styles.expandedNode,
            isActionable ? styles.childActionable : styles.childNotActionable
          )}
        >
          expanded node
        </div>
      )}
    </div>
  );
};

export default memo(Node);

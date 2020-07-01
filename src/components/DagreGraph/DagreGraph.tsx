import React, { FC, memo, useCallback, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import { Pathway, State } from 'pathways-model';
import { isBranchState } from 'utils/nodeUtils';
import GraphProvider from './GraphProvider';
import GraphWrapper from './GraphWrapper';
import Node from './Node';
import useExpandedState from './useExpandedState';

interface DagreGraphProps {
  pathway: Pathway;
  currentNode: State;
  interactive?: boolean;
}

const DagreGraph: FC<DagreGraphProps> = ({ pathway, currentNode, interactive = true }) => {
  const currentNodeIsBranchNode = useMemo(() => isBranchState(currentNode), [currentNode]);
  const { expanded, toggleExpanded } = useExpandedState(pathway);
  const { id: pathwayId } = useParams();
  const history = useHistory();
  const redirectToNode = useCallback(
    nodeId => {
      const url = `/builder/${encodeURIComponent(pathwayId)}/node/${encodeURIComponent(nodeId)}`;
      if (url !== history.location.pathname) {
        history.push(url);
      }
    },
    [history, pathwayId]
  );
  const onClick = useCallback(
    (nodeName: string) => {
      redirectToNode(nodeName);
      toggleExpanded(nodeName);
    },
    [redirectToNode, toggleExpanded]
  );

  return (
    <GraphProvider>
      <GraphWrapper>
        {Object.keys(pathway.states).map(nodeName => {
          const pathwayState = pathway.states[nodeName];
          const isActionable =
            pathwayState.key === currentNode.key ||
            (currentNodeIsBranchNode &&
              currentNode.transitions.some(e => e?.transition === nodeName));

          return (
            <Node
              key={nodeName}
              nodeKey={nodeName}
              pathwayState={pathwayState}
              isActionable={isActionable}
              isExpanded={Boolean(expanded[nodeName])}
              onClick={interactive ? onClick : undefined}
            />
          );
        })}
      </GraphWrapper>
    </GraphProvider>
  );
};

export default memo(DagreGraph);

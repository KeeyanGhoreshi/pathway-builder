import React, { FC, Ref, forwardRef, memo, useCallback, useState, useEffect } from 'react';
import { GuidanceState, State } from 'pathways-model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import styles from './Node.module.scss';
import ExpandedNode from 'components/ExpandedNode';
import { isGuidanceState, isBranchState } from 'utils/nodeUtils';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import {
  faMicroscope,
  faPlay,
  faPrescriptionBottleAlt,
  faSyringe,
  faCheckCircle,
  faTimesCircle,
  faBookMedical
} from '@fortawesome/free-solid-svg-icons';

interface NodeProps {
  nodeKey: string;
  currentNodeKey: string;
  pathwayState: State;
  xCoordinate: number;
  yCoordinate: number;
  isTransitionOfCurrentBranch: boolean;
  expanded?: boolean;
  onClick?: (nodeName: string) => void;
}

const Node: FC<NodeProps & { ref: Ref<HTMLDivElement> }> = memo(
  forwardRef<HTMLDivElement, NodeProps>(
    (
      {
        nodeKey,
        currentNodeKey,
        pathwayState,
        xCoordinate,
        yCoordinate,
        isTransitionOfCurrentBranch,
        expanded = false,
        onClick
      },
      ref
    ) => {
      let currentProps: any = {
        nodeKey: nodeKey,
        currentNodeKey: currentNodeKey,
        pathwayState: pathwayState,
        xCoordinate: xCoordinate,
        yCoordinate: yCoordinate,
        isTransitionOfCurrentBranch: isTransitionOfCurrentBranch,
        expanded: expanded
      };
      if (onClick) currentProps.onClick = onClick.toString();
      console.log('Rendering Node: ' + nodeKey);
      console.log(currentProps);

      const [hasMetadata, setHasMetadata] = useState<boolean>(
        isGuidanceState(pathwayState) ? pathwayState.action.length > 0 : false
      );

      const onClickHandler = useCallback(() => {
        if (onClick) onClick(nodeKey);
      }, [onClick, nodeKey]);

      useEffect(() => {
        if (!hasMetadata && isGuidanceState(pathwayState) && pathwayState.action.length > 0) {
          setHasMetadata(true);
          if (!expanded) {
            onClickHandler();
          }
        }
      }, [hasMetadata, pathwayState, setHasMetadata, onClickHandler, expanded]);

      useEffect(() => {
        console.log('mounting Node: ' + nodeKey);

        return () => console.log('unmounting node: ' + nodeKey);
      }, []);

      const { label } = pathwayState;
      const style = {
        top: yCoordinate,
        left: xCoordinate
      };

      const isCurrentNode = pathwayState.key === currentNodeKey;

      const isActionable = isCurrentNode;
      const topLevelClasses = [styles.node];
      let expandedNodeClass = '';
      if (expanded) topLevelClasses.push('expanded');
      if (isActionable || isTransitionOfCurrentBranch) {
        topLevelClasses.push(styles.actionable);
        expandedNodeClass = styles.childActionable;
      } else {
        expandedNodeClass = styles.childNotActionable;
      }
      const isGuidance = isGuidanceState(pathwayState);
      return (
        <div className={topLevelClasses.join(' ')} style={style} ref={ref}>
          <div className={`nodeTitle ${onClickHandler && 'clickable'}`} onClick={onClickHandler}>
            <div className="iconAndLabel">
              <NodeIcon pathwayState={pathwayState} isGuidance={isGuidance} />
              {label}
            </div>
            <StatusIcon status={null} />
          </div>
          {expanded && (
            <div className={`${styles.expandedNode} ${expandedNodeClass}`}>
              <ExpandedNode
                pathwayState={pathwayState as GuidanceState}
                isActionable={isActionable}
                isGuidance={isGuidance}
              />
            </div>
          )}
        </div>
      );
    }
  )
);

interface NodeIconProps {
  pathwayState: State;
  isGuidance: boolean;
}

const NodeIcon: FC<NodeIconProps> = ({ pathwayState, isGuidance }) => {
  let icon: IconDefinition | undefined;
  if (pathwayState.label === 'Start') icon = faPlay;
  else if (isGuidance) {
    const guidancePathwayState = pathwayState as GuidanceState;
    if (guidancePathwayState.action.length > 0) {
      const resourceType = guidancePathwayState.action[0].resource.resourceType;
      if (resourceType === 'MedicationRequest') icon = faPrescriptionBottleAlt;
      else if (resourceType === 'ServiceRequest') icon = faSyringe;
      else if (resourceType === 'CarePlan') icon = faBookMedical;
    }
  } else {
    icon = faMicroscope;
  }

  return icon ? <FontAwesomeIcon icon={icon} className={styles.icon} /> : null;
};

interface StatusIconProps {
  status: boolean | null;
}

const StatusIcon: FC<StatusIconProps> = ({ status }) => {
  if (status == null) {
    return null;
  }
  const icon = status ? faCheckCircle : faTimesCircle;
  return (
    <div className="statusIcon">
      <FontAwesomeIcon icon={icon} className={styles.icon} />
    </div>
  );
};

Node.whyDidYouRender = true;

export default Node;

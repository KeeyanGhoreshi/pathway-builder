import React, { FC, memo, useCallback, useState, useEffect, useRef, RefObject } from 'react';
import { useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faPlus } from '@fortawesome/free-solid-svg-icons';

import { SidebarHeader, BranchNode, ActionNode, NullNode, SidebarButton } from '.';
import { State, GuidanceState, BranchState, Pathway } from 'pathways-model';
import { setStateNodeType, addTransition, createState, addState, getNodeType } from 'utils/builder';
import useStyles from './styles';
import { useCurrentPathwayContext } from 'components/CurrentPathwayProvider';

interface SidebarProps {
  updatePathway: (pathway: Pathway) => void;
  headerElement: RefObject<HTMLDivElement>;
  currentNode: GuidanceState | BranchState | State;
}

const Sidebar: FC<SidebarProps> = ({ updatePathway, headerElement, currentNode }) => {
  const { pathway, pathwayRef } = useCurrentPathwayContext();
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const styles = useStyles();
  const history = useHistory();
  const sidebarContainerElement = useRef<HTMLDivElement>(null);
  const currentNodeKey = currentNode?.key;

  const toggleSidebar = useCallback((): void => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const changeNodeType = useCallback(
    (nodeType: string): void => {
      if (currentNodeKey && pathwayRef.current)
        updatePathway(setStateNodeType(pathwayRef.current, currentNodeKey, nodeType));
    },
    [pathwayRef, updatePathway, currentNodeKey]
  );

  const redirectToNode = useCallback(
    nodeKey => {
      if (!pathwayRef.current) return;

      const url = `/builder/${encodeURIComponent(pathwayRef.current.id)}/node/${encodeURIComponent(
        nodeKey
      )}`;
      if (url !== history.location.pathname) {
        history.push(url);
      }
    },
    [history, pathwayRef]
  );

  const addNode = useCallback(
    (nodeType: string): void => {
      if (!currentNodeKey || !pathwayRef.current) return;

      const newState = createState();
      let newPathway = addState(pathwayRef.current, newState);
      newPathway = addTransition(newPathway, currentNodeKey, newState.key as string);
      newPathway = setStateNodeType(newPathway, newState.key as string, nodeType);
      updatePathway(newPathway);
      redirectToNode(newState.key);
    },
    [pathwayRef, updatePathway, currentNodeKey, redirectToNode]
  );

  const addBranchNode = useCallback((): void => addNode('branch'), [addNode]);

  const addActionNode = useCallback((): void => addNode('action'), [addNode]);

  // Set the height of the sidebar container
  useEffect(() => {
    if (sidebarContainerElement?.current && headerElement?.current)
      sidebarContainerElement.current.style.height =
        window.innerHeight - headerElement.current.clientHeight + 'px';
  }, [isExpanded, headerElement]);

  if (!pathway) return <div>Error: No pathway</div>;

  const nodeType = getNodeType(pathway, currentNodeKey);
  // If the node does not have transitions it can be added to
  const displayAddButtons = currentNode.key !== undefined && currentNode.transitions.length === 0;
  return (
    <>
      {isExpanded && (
        <div className={styles.root} ref={sidebarContainerElement}>
          <SidebarHeader
            currentNode={currentNode}
            updatePathway={updatePathway}
            isTransition={false}
          />

          <hr className={styles.divider} />

          {nodeType === 'null' && (
            <NullNode currentNode={currentNode} changeNodeType={changeNodeType} />
          )}

          {nodeType === 'action' && (
            <ActionNode
              currentNode={currentNode as GuidanceState}
              changeNodeType={changeNodeType}
              updatePathway={updatePathway}
            />
          )}

          {nodeType === 'branch' && (
            <BranchNode
              currentNode={currentNode}
              changeNodeType={changeNodeType}
              updatePathway={updatePathway}
            />
          )}

          {displayAddButtons && (
            <>
              {currentNode.key !== 'Start' && <hr className={styles.divider} />}
              <SidebarButton
                buttonName="Add Action Node"
                buttonIcon={faPlus}
                buttonText="Any clinical or workflow step which is not a decision."
                onClick={addActionNode}
              />

              <SidebarButton
                buttonName="Add Branch Node"
                buttonIcon={faPlus}
                buttonText="A logical branching point based on clinical or workflow criteria."
                onClick={addBranchNode}
              />
            </>
          )}
        </div>
      )}

      <div className={styles.toggleSidebar} onClick={toggleSidebar}>
        <FontAwesomeIcon icon={isExpanded ? faChevronLeft : faChevronRight} />
      </div>
    </>
  );
};

export default memo(Sidebar);

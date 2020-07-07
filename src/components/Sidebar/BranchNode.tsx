import React, { FC, memo, useCallback, ChangeEvent } from 'react';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import { SidebarButton, BranchTransition } from '.';
import DropDown from 'components/elements/DropDown';
import { addTransition, createState, addState } from 'utils/builder';
import { Pathway, State } from 'pathways-model';
import useStyles from './styles';
import { useCurrentPathwayContext } from 'components/CurrentPathwayProvider';

const nodeTypeOptions = [
  { value: 'action', label: 'Action' },
  { value: 'branch', label: 'Branch' }
];

interface BranchNodeProps {
  currentNode: State;
  changeNodeType: (event: string) => void;
  updatePathway: (pathway: Pathway) => void;
}

const BranchNode: FC<BranchNodeProps> = ({ currentNode, changeNodeType, updatePathway }) => {
  const { pathwayRef } = useCurrentPathwayContext();
  const currentNodeKey = currentNode?.key;
  const styles = useStyles();

  const selectNodeType = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      changeNodeType(event?.target.value || '');
    },
    [changeNodeType]
  );

  const handleAddTransition = useCallback((): void => {
    const newState = createState();

    const newPathway = addState(pathwayRef.current, newState);
    updatePathway(addTransition(newPathway, currentNodeKey || '', newState.key as string));
  }, [pathwayRef, updatePathway, currentNodeKey]);

  return (
    <>
      <DropDown
        id="nodeType"
        label="Node Type"
        options={nodeTypeOptions}
        onChange={selectNodeType}
        value="branch"
      />
      {currentNode.transitions.map(transition => {
        return (
          <BranchTransition
            key={transition.id}
            currentNodeKey={currentNodeKey || ''}
            transition={transition}
            updatePathway={updatePathway}
          />
        );
      })}

      <hr className={styles.divider} />

      <SidebarButton
        buttonName="Add Transition"
        buttonIcon={faPlus}
        buttonText="Add transition logic for a clinical decision within a workflow."
        onClick={handleAddTransition}
      />
    </>
  );
};

export default memo(BranchNode);

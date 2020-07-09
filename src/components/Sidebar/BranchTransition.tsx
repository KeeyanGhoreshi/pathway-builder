import React, { FC, memo, useState, useCallback, ChangeEvent } from 'react';
import { faPlus, faTools } from '@fortawesome/free-solid-svg-icons';
import DropDown from 'components/elements/DropDown';
import { TextField } from '@material-ui/core';
import { setTransitionCondition, setTransitionConditionDescription } from 'utils/builder';
import { SidebarHeader, SidebarButton } from '.';
import { Pathway, Transition } from 'pathways-model';
import { useCriteriaContext } from 'components/CriteriaProvider';
import useStyles from './styles';
import { useCurrentPathwayContext } from 'components/CurrentPathwayProvider';
import { useCurrentNodeContext } from 'components/CurrentNodeProvider';

interface BranchTransitionProps {
  transition: Transition;
  updatePathway: (pathway: Pathway) => void;
}

const BranchTransition: FC<BranchTransitionProps> = ({ transition, updatePathway }) => {
  const { criteria } = useCriteriaContext();
  const { pathway, pathwayRef } = useCurrentPathwayContext();
  const { currentNodeRef } = useCurrentNodeContext();
  const criteriaOptions = criteria.map(c => ({ value: c.id, label: c.label }));
  const styles = useStyles();
  const transitionKey = transition?.transition || '';
  const transitionNode = pathway?.states[transitionKey];
  const [useCriteriaSelected, setUseCriteriaSelected] = useState<boolean>(false);

  const handleUseCriteria = useCallback((): void => {
    setUseCriteriaSelected(!useCriteriaSelected);
  }, [useCriteriaSelected]);

  const selectCriteriaSource = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNodeRef.current?.key || !transition.id || !pathwayRef.current) return;

      const criteriaSource = event?.target.value || '';
      let elm = undefined;
      criteria.forEach(c => {
        if (c.id === criteriaSource) {
          elm = c.elm;
        }
      });
      if (!elm) return;
      updatePathway(
        setTransitionCondition(
          pathwayRef.current,
          currentNodeRef.current.key,
          transition.id,
          transition.condition?.description || '',
          elm,
          criteriaSource
        )
      );
    },
    [currentNodeRef, transition.id, updatePathway, pathwayRef, transition.condition, criteria]
  );

  const setCriteriaDisplay = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNodeRef.current?.key || !transition.id || !pathwayRef.current) return;

      const criteriaDisplay = event?.target.value || '';
      updatePathway(
        setTransitionConditionDescription(
          pathwayRef.current,
          currentNodeRef.current.key,
          transition.id,
          criteriaDisplay
        )
      );
    },
    [currentNodeRef, transition.id, updatePathway, pathwayRef]
  );
  return (
    <>
      <hr className={styles.divider} />

      {transitionNode && <SidebarHeader updatePathway={updatePathway} isTransition={true} />}

      {!(useCriteriaSelected || transition.condition?.cql) && (
        <SidebarButton
          buttonName="Use Criteria"
          buttonIcon={faPlus}
          buttonText="Add previously built or imported criteria logic to branch node."
          onClick={handleUseCriteria}
        />
      )}

      {(useCriteriaSelected || transition.condition?.cql) && (
        <>
          <DropDown
            id="Criteria"
            label="Criteria"
            options={criteriaOptions}
            onChange={selectCriteriaSource}
            value={transition.condition?.cql || undefined}
          />
          <TextField
            label="Criteria Display"
            value={transition.condition?.description || ''}
            variant="outlined"
            onChange={setCriteriaDisplay}
            error={!transition.condition?.description}
          />
        </>
      )}

      <SidebarButton
        buttonName="Build Criteria"
        buttonIcon={faTools}
        buttonText="Create new criteria logic to add to branch node."
      />
    </>
  );
};
export default memo(BranchTransition);

import React, { FC, memo, useCallback, ChangeEvent } from 'react';
import { SidebarButton } from '.';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import {
  setStateAction,
  createCQL,
  setActionDescription,
  setGuidanceStateElm
} from 'utils/builder';
import DropDown from 'components/elements/DropDown';
import { Pathway, GuidanceState, Action } from 'pathways-model';
import { ElmLibrary } from 'elm-model';
import useStyles from './styles';
import shortid from 'shortid';
import { TextField } from '@material-ui/core';
import { convertBasicCQL } from 'engine/cql-to-elm';

const nodeTypeOptions = [
  { label: 'Action', value: 'action' },
  { label: 'Branch', value: 'branch' }
];

const actionTypeOptions = [
  { label: 'Medication', value: 'MedicationRequest' },
  { label: 'Procedure', value: 'ServiceRequest' },
  { label: 'Regimen', value: 'CarePlan' }
];

const codeSystemOptions = [
  { label: 'ICD-9-CM', value: 'http://hl7.org/fhir/sid/icd-9-cm' },
  { label: 'ICD-10-CM', value: 'http://hl7.org/fhir/sid/icd-10-cm' },
  { label: 'LOINC', value: 'http://loinc.org' },
  { label: 'NCI', value: 'http://ncimeta.nci.nih.gov' },
  { label: 'RXNORM', value: 'http://www.nlm.nih.gov/research/umls/rxnorm' },
  { label: 'SNOMED', value: 'http://snomed.info/sct' }
];

interface ActionNodeProps {
  pathway: Pathway;
  currentNode: GuidanceState;
  changeNodeType: (event: string) => void;
  updatePathway: (pathway: Pathway) => void;
}

const ActionNode: FC<ActionNodeProps> = ({
  pathway,
  currentNode,
  changeNodeType,
  updatePathway
}) => {
  const styles = useStyles();
  const selectNodeType = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      changeNodeType(event?.target.value || '');
    },
    [changeNodeType]
  );

  const addActionCQL = useCallback(
    (action: Action, currentNodeKey: string): void => {
      const cql = createCQL(action, currentNodeKey);
      convertBasicCQL(cql).then(elm => {
        updatePathway(setGuidanceStateElm(pathway, currentNodeKey, elm as ElmLibrary));
      });
    },
    [pathway, updatePathway]
  );

  const changeCode = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNode.key) return;

      const code = event?.target.value || '';
      const action: Action = currentNode.action[0];
      if (action.resource.medicationCodeableConcept) {
        action.resource.medicationCodeableConcept.coding[0].code = code;
      } else {
        action.resource.code.coding[0].code = code;
      }
      resetDisplay(action);
      updatePathway(setStateAction(pathway, currentNode.key, [action]));
    },
    [currentNode, pathway, updatePathway]
  );

  const changeDescription = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNode.key) return;

      const description = event?.target.value || '';
      const actionId = currentNode.action[0].id; // TODO: change this for supporting multiple action
      if (actionId) {
        setActionDescription(pathway, currentNode.key, actionId, description);
        updatePathway(setStateAction(pathway, currentNode.key, currentNode.action));
      }
    },
    [currentNode, pathway, updatePathway]
  );

  const changeTitle = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNode.key) return;

      const title = event?.target.value || '';
      const action = currentNode.action[0];
      action.resource.title = title;
      resetDisplay(action);
      updatePathway(setStateAction(pathway, currentNode.key, [action]));

      addActionCQL(action, currentNode.key);
    },
    [currentNode, pathway, updatePathway, addActionCQL]
  );

  const selectActionType = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNode.key) return;
      const value = event?.target.value || '';
      const actionType = actionTypeOptions.find(option => {
        return option.value === value;
      });
      let action: Action;
      if (actionType?.value === 'CarePlan') {
        action = {
          type: 'create',
          description: '',
          id: shortid.generate(),
          resource: {
            resourceType: actionType?.value,
            title: ''
          }
        };
      } else if (actionType?.value === 'MedicationRequest') {
        action = {
          type: 'create',
          description: '',
          id: shortid.generate(),
          resource: {
            resourceType: actionType?.value,
            medicationCodeableConcept: {
              coding: [
                {
                  system: '',
                  code: '',
                  display: ''
                }
              ]
            }
          }
        };
      } else {
        action = {
          type: 'create',
          description: '',
          id: shortid.generate(),
          resource: {
            resourceType: actionType?.value,
            code: {
              coding: [
                {
                  system: '',
                  code: '',
                  display: ''
                }
              ]
            }
          }
        };
      }

      updatePathway(setStateAction(pathway, currentNode.key, [action]));
    },
    [currentNode, pathway, updatePathway]
  );

  const selectCodeSystem = useCallback(
    (event: ChangeEvent<{ value: string }>): void => {
      if (!currentNode.key) return;

      const codeSystem = event?.target.value || '';
      const action = currentNode.action[0];
      if (action.resource.medicationCodeableConcept) {
        action.resource.medicationCodeableConcept.coding[0].system = codeSystem;
      } else {
        action.resource.code.coding[0].system = codeSystem;
      }
      resetDisplay(action);
      updatePathway(setStateAction(pathway, currentNode.key, [action]));
    },
    [currentNode, pathway, updatePathway]
  );

  const validateFunction = useCallback((): void => {
    if (currentNode.key && currentNode.action.length) {
      const action = currentNode.action[0];
      if (action.resource.medicationCodeableConcept) {
        action.resource.medicationCodeableConcept.coding[0].display = 'Example display text';
      } else if (action.resource.title) {
        action.resource.description = 'Example CarePlan Text';
      } else {
        action.resource.code.coding[0].display = 'Example display text'; // TODO: actually validate
      }
      updatePathway(setStateAction(pathway, currentNode.key, [action]));

      addActionCQL(action, currentNode.key);
    } else {
      console.error('No Actions -- Cannot Validate');
    }
  }, [currentNode, pathway, updatePathway, addActionCQL]);

  const resetDisplay = (action: Action): void => {
    if (action.resource.medicationCodeableConcept) {
      action.resource.medicationCodeableConcept.coding[0].display = '';
    } else if (action.resource.resourceType === 'CarePlan') {
      action.resource.description = '';
    } else {
      action.resource.code.coding[0].display = ''; // TODO: actually validate
    }
  };

  const onEnter = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      validateFunction();
    }
  };

  // The node has a key and is not the start node
  const changeNodeTypeEnabled = currentNode.key !== undefined && currentNode.key !== 'Start';
  const action = currentNode.action;
  const resource = action?.length > 0 && action[0].resource;
  let system = '';
  let code = '';
  let display = '';
  if (resource.resourceType === 'MedicationRequest' || resource.resourceType === 'ServiceRequest') {
    system = resource.code
      ? resource.code.coding[0].system
      : resource.medicationCodeableConcept.coding[0].system;
    code = resource.code
      ? resource.code.coding[0].code
      : resource.medicationCodeableConcept.coding[0].code;
    display = resource.code
      ? resource.code.coding[0].display
      : resource.medicationCodeableConcept.coding[0].display;
  } else {
    display = resource.description;
  }

  return (
    <>
      {changeNodeTypeEnabled && (
        <>
          <DropDown
            id="nodeType"
            label="Node Type"
            options={nodeTypeOptions}
            onChange={selectNodeType}
            value="action"
          />
          <DropDown
            id="actionType"
            label="Action Type"
            options={actionTypeOptions}
            onChange={selectActionType}
            value={resource.resourceType}
          />
          {(resource.resourceType === 'MedicationRequest' ||
            resource.resourceType === 'ServiceRequest') && (
            <>
              <DropDown
                id="codeSystem"
                label="Code System"
                options={codeSystemOptions}
                onChange={selectCodeSystem}
                value={system}
              />
              {system && (
                <TextField
                  id="code-input"
                  label="Code"
                  value={code}
                  onChange={changeCode}
                  variant="outlined"
                  error={code === ''}
                  inputProps={{ onKeyPress: onEnter }}
                />
              )}
              {code && (
                <>
                  {display ? (
                    <div className={styles.displayText}>
                      <FontAwesomeIcon icon={faCheckCircle} /> {display}
                    </div>
                  ) : (
                    <SidebarButton
                      buttonName="Validate"
                      buttonIcon={faCheckCircle}
                      buttonText={display || 'Check validation of the input system and code'}
                      onClick={validateFunction}
                    />
                  )}

                  <TextField
                    id="description-input"
                    label="Description"
                    value={action[0].description || ''}
                    onChange={changeDescription}
                    variant="outlined"
                    error={action[0].description === ''}
                  />
                </>
              )}
            </>
          )}

          {resource.resourceType === 'CarePlan' && (
            // design for careplan ?
            <>
              <TextField
                id="title-input"
                label="Title"
                value={resource.title || ''}
                onChange={changeTitle}
                variant="outlined"
                error={resource.title == null}
                inputProps={{ onKeyPress: onEnter }}
              />
              {resource.title && (
                <TextField
                  id="description-input"
                  label="Description"
                  value={action[0].description || ''}
                  onChange={changeDescription}
                  variant="outlined"
                  error={action[0].description === ''}
                />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default memo(ActionNode);

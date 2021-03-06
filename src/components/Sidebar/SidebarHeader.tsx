import React, { FC, memo, useCallback, useRef, useState, KeyboardEvent, FocusEvent } from 'react';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faEdit,
  faEllipsisH,
  faChevronLeft,
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
import { IconButton, FormControl, Input } from '@material-ui/core';

import { Pathway, PathwayNode } from 'pathways-model';
import { setNodeLabel } from 'utils/builder';
import { usePathwayContext } from 'components/PathwayProvider';
import useStyles from './styles';

interface SidebarHeaderProps {
  pathway: Pathway;
  currentNode: PathwayNode;
  isTransition: boolean;
}

const SidebarHeader: FC<SidebarHeaderProps> = ({ pathway, currentNode, isTransition }) => {
  const { updatePathway } = usePathwayContext();
  const [showInput, setShowInput] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const currentNodeKey = currentNode?.key;
  const currentNodeLabel = currentNode?.label || '';
  const styles = useStyles();

  const goToParentNode = useCallback(() => {
    // TODO
  }, []);

  const goToNode = useCallback(() => {
    // TODO
  }, []);

  const openNodeOptions = useCallback(() => {
    // TODO
  }, []);

  const changeNodeLabel = useCallback(() => {
    const label = inputRef.current?.value ?? '';
    if (currentNodeKey) updatePathway(setNodeLabel(pathway, currentNodeKey, label));
    setShowInput(false);
  }, [pathway, updatePathway, currentNodeKey]);

  const handleShowInput = useCallback(() => {
    setShowInput(true);
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent<HTMLDivElement>): void => {
      if (event.key === 'Enter') changeNodeLabel();
    },
    [changeNodeLabel]
  );

  return (
    <div className={styles.sidebarHeader}>
      <div className={styles.sidebarHeaderGroup}>
        {currentNodeKey !== 'Start' && !isTransition && (
          <IconButton
            className={styles.sidebarHeaderButton}
            onClick={goToParentNode}
            aria-label="go to parent node"
          >
            <FontAwesomeIcon icon={faChevronLeft} />
          </IconButton>
        )}

        <div className={styles.headerLabelGroup} onClick={handleShowInput}>
          {showInput && currentNodeKey !== 'Start' ? (
            <FormControl className={styles.formControl} fullWidth>
              <Input
                className={styles.headerLabel}
                type="text"
                inputRef={inputRef}
                onBlur={changeNodeLabel}
                onKeyPress={handleKeyPress}
                defaultValue={currentNodeLabel}
                autoFocus
                onFocus={(event: FocusEvent<HTMLInputElement>): void => event.target.select()}
              />
            </FormControl>
          ) : (
            <div
              className={clsx(
                styles.headerLabel,
                styles.headerLabelText,
                currentNodeKey === 'Start' && styles.headerLabelStart
              )}
            >
              {currentNodeLabel}
              {currentNodeKey !== 'Start' && (
                <FontAwesomeIcon className={styles.editIcon} icon={faEdit} />
              )}
            </div>
          )}
        </div>
      </div>

      <div className={styles.sidebarHeaderGroup}>
        <IconButton
          className={styles.sidebarHeaderButton}
          onClick={isTransition ? goToNode : openNodeOptions}
          aria-label={isTransition ? 'go to transition node' : 'open node options'}
        >
          <FontAwesomeIcon icon={isTransition ? faChevronRight : faEllipsisH} />
        </IconButton>
      </div>
    </div>
  );
};

export default memo(SidebarHeader);

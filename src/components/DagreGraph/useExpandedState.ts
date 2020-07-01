import { useState, useCallback } from 'react';

import { Pathway } from 'pathways-model';

interface ExpandedState {
  [key: string]: boolean | string | null;
}

interface ExpandedStateToggle {
  expanded: ExpandedState;
  toggleExpanded: (nodeName: string) => void;
}

const useExpandedState = (pathway: Pathway): ExpandedStateToggle => {
  const [expanded, setExpanded] = useState<ExpandedState>(() =>
    Object.keys(pathway.states).reduce(
      (acc, curr: string) => {
        acc[curr] = false;
        return acc;
      },
      { lastSelectedNode: null } as ExpandedState
    )
  );

  const toggleExpanded = useCallback((nodeName: string) => {
    if (nodeName === 'Start') {
      setExpanded(prevState => ({
        ...prevState,
        lastSelectedNode: nodeName
      }));
    } else {
      setExpanded(prevState => ({
        ...prevState,
        [nodeName]:
          !prevState[nodeName] || prevState.lastSelectedNode === nodeName
            ? !prevState[nodeName]
            : prevState[nodeName],
        lastSelectedNode: nodeName
      }));
    }
  }, []);

  return { expanded, toggleExpanded };
};

export default useExpandedState;

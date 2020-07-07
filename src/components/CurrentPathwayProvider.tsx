import React, {
  ReactNode,
  createContext,
  useContext,
  FC,
  memo,
  useCallback,
  MutableRefObject
} from 'react';
import { Pathway } from 'pathways-model';
import useRefState from 'utils/useRefState';

interface CurrentPathwayContextInterface {
  pathway: Pathway;
  pathwayRef: MutableRefObject<Pathway>;
  setPathway: (value: Pathway) => void;
}

export const CurrentPathwayContext = createContext<CurrentPathwayContextInterface>(
  {} as CurrentPathwayContextInterface
);

interface CurrentPathwayProviderProps {
  children: ReactNode;
}

export const CurrentPathwayProvider: FC<CurrentPathwayProviderProps> = memo(({ children }) => {
  console.log('creating current pathway provider');
  const [pathway, pathwayRef, _setPathway] = useRefState<Pathway>({} as Pathway);

  const setPathway = useCallback(
    (value: Pathway) => {
      console.log('Setting current pathway');
      console.log(value);
      _setPathway(value);
    },
    [_setPathway]
  );

  return (
    <CurrentPathwayContext.Provider value={{ pathway, pathwayRef, setPathway }}>
      {children}
    </CurrentPathwayContext.Provider>
  );
});

export const useCurrentPathwayContext = (): CurrentPathwayContextInterface =>
  useContext(CurrentPathwayContext);

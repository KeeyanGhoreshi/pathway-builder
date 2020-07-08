import React, {
  FC,
  memo,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode
} from 'react';
import { Pathway } from 'pathways-model';
import { ServiceLoaded } from 'pathways-objects';
import config from 'utils/ConfigManager';
import useGetService from './Services';

interface PathwayContextInterface {
  pathways: Pathway[];
  status: string;
  addPathway: (pathway: Pathway) => void;
  deletePathway: (id: string) => void;
  updatePathwayAtIndex: (pathway: Pathway, index: number) => void;
}

export const PathwayContext = createContext<PathwayContextInterface>({} as PathwayContextInterface);

interface PathwayProviderProps {
  children: ReactNode;
}

export const PathwayProvider: FC<PathwayProviderProps> = memo(function PathwayProvider({
  children
}) {
  const [pathways, setPathways] = useState<Pathway[]>([]);
  const service = useGetService<Pathway>(config.get('demoPathwaysService'));
  const servicePayload = (service as ServiceLoaded<Pathway[]>).payload;

  if (pathways.length >= 3) console.log(JSON.stringify(pathways[2].states, undefined, 2));

  const addPathway = useCallback((pathway: Pathway) => {
    setPathways(currentPathways => [...currentPathways, pathway]);
  }, []);

  const deletePathway = useCallback((id: string) => {
    setPathways(currentPathways => currentPathways.filter(pathway => pathway.id !== id));
  }, []);

  const updatePathwayAtIndex = useCallback((pathway: Pathway, index: number) => {
    // debugger;
    setPathways(currentPathways => [
      ...currentPathways.slice(0, index),
      pathway,
      ...currentPathways.slice(index + 1)
    ]);
  }, []);

  useEffect(() => {
    if (servicePayload) setPathways(servicePayload);
  }, [servicePayload]);

  switch (service.status) {
    case 'error':
      return <div>Error loading pathways</div>;

    default:
      return (
        <PathwayContext.Provider
          value={{
            pathways,
            addPathway,
            deletePathway,
            updatePathwayAtIndex,
            status: service.status
          }}
        >
          {children}
        </PathwayContext.Provider>
      );
  }
});

export const usePathwayContext = (): PathwayContextInterface => useContext(PathwayContext);

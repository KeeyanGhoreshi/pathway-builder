import React, { FC, ReactNode, memo, createContext, useContext, useEffect, useMemo, useState } from 'react';

import dagre, { graphlib, Node } from 'dagre';

interface NodeCoordinates {
  [nodeName: string]: Node;
}

interface GraphContextInterface {
  graph: graphlib.Graph;
}

interface GraphDimensionsContextInterface {
  coordinates: NodeCoordinates;
  width: number;
  setWidth: (width: number) => void;
}

export const GraphContext = createContext<GraphContextInterface>({} as GraphContextInterface);
export const GraphDimensionsContext = createContext<GraphDimensionsContextInterface>(
  {} as GraphDimensionsContextInterface
);

interface GraphProviderProps {
  children: ReactNode;
}

const createGraph = (): graphlib.Graph => {
  const g = new dagre.graphlib.Graph();
  g.setGraph({});
  g.setDefaultEdgeLabel(() => ({})); // dagre requires a default edge label, we want it to just be empty
  return g;
};

const GraphProvider: FC<GraphProviderProps> = memo(({ children }) => {
  const graph = useMemo(createGraph, []);
  const [coordinates] = useState<NodeCoordinates>({} as NodeCoordinates);
  const [width, setWidth] = useState<number>(0);
  const graphValue = useMemo(() => ({ graph }), [graph]);

  useEffect(() => {
    dagre.layout(graph);
    console.log(graph);
  }, [graph]);

  return (
    <GraphContext.Provider value={graphValue}>
      <GraphDimensionsContext.Provider value={{ coordinates, width, setWidth }}>
        {children}
      </GraphDimensionsContext.Provider>
    </GraphContext.Provider>
  );
});

export default GraphProvider;
export const useGraphProvider = (): GraphContextInterface => useContext(GraphContext);
export const useGraphDimensions = (): GraphDimensionsContextInterface =>
  useContext(GraphDimensionsContext);

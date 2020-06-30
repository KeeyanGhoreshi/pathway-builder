import React, {
  FC,
  RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  memo
} from 'react';
import { useParams, useHistory } from 'react-router-dom';

import graphLayout from 'visualization/layout';
import Node from 'components/Node';
import Arrow from 'components/Arrow';
import { Pathway, State } from 'pathways-model';
import { Layout, NodeDimensions, NodeCoordinates, Edges } from 'graph-model';
import styles from './Graph.module.scss';
import ResizeSensor from 'css-element-queries/src/ResizeSensor';
import { isBranchState } from 'utils/nodeUtils';
import TestComponent from 'components/TestComponent';

interface GraphProps {
  pathway: Pathway;
  interactive?: boolean;
  expandCurrentNode?: boolean;
  currentNode: State;
}

interface ExpandedState {
  [key: string]: boolean | string | null;
}

const Graph: FC<GraphProps> = memo(
  ({ pathway, interactive = true, expandCurrentNode = true, currentNode }) => {
    const graphElement = useRef<HTMLDivElement>(null);
    const nodeRefs = useRef<{ [key: string]: HTMLDivElement }>({});
    const [parentWidth, setParentWidth] = useState<number>(
      graphElement?.current?.parentElement?.clientWidth ?? 0
    );

    useEffect(() => {
      console.log('Mounting graph');

      return () => console.log('unmounting graph');
    }, []);

    // Get the layout of the graph
    const getGraphLayout = useCallback((): Layout => {
      const nodeDimensions: NodeDimensions = {};

      // Retrieve dimensions from nodeRefs
      if (nodeRefs?.current) {
        Object.keys(nodeRefs.current).forEach(key => {
          const nodeElement = nodeRefs.current[key];
          const width = nodeElement.clientWidth;
          // nodeElement can have multiple children so calculate the sum to get the node height
          const height = Array.from(nodeElement.children).reduce(
            (acc, child) => acc + child.clientHeight,
            0
          );

          nodeDimensions[key] = { width, height };
        });
      }

      return graphLayout(pathway, nodeDimensions);
    }, [pathway]);

    const [layout, setLayout] = useState(getGraphLayout());
    const { nodeCoordinates, edges } = layout;
    const maxHeight = useMemo(() => {
      return nodeCoordinates !== undefined
        ? Object.values(nodeCoordinates)
            .map(x => x.y)
            .reduce((a, b) => Math.max(a, b))
        : 0;
    }, [nodeCoordinates]);

    // If a node has a negative x value, shift nodes and edges to the right by that value
    const minX =
      nodeCoordinates !== undefined
        ? Object.values(nodeCoordinates)
            .map(x => x.x + parentWidth / 2)
            .reduce((a, b) => Math.min(a, b))
        : 0;

    if (minX < 0) {
      const toAdd = minX * -1;
      Object.keys(nodeCoordinates).forEach(key => {
        const node = nodeCoordinates[key];
        node.x += toAdd;
      });

      Object.keys(edges).forEach(key => {
        const edge = edges[key];

        edge.points.forEach(p => (p.x += toAdd));
        if (edge.label) edge.label.x += toAdd;
      });
    }

    // Find node that is farthest to the right
    const maxWidth = useMemo(() => {
      return nodeCoordinates !== undefined
        ? Object.values(nodeCoordinates)
            // Add width of the node to account for x coordinate starting at top left corner
            .map(x => x.x + parentWidth / 2 + (x.width ?? 0))
            .reduce((a, b) => Math.max(a, b))
        : 0;
    }, [nodeCoordinates, parentWidth]);

    const [expanded, setExpanded] = useState<ExpandedState>(() =>
      Object.keys(layout).reduce(
        (acc, curr: string) => {
          acc[curr] = false;
          return acc;
        },
        { lastSelectedNode: null } as ExpandedState
      )
    );

    const toggleExpanded = useCallback((key: string) => {
      if (key === 'Start') {
        setExpanded(prevState => ({
          ...prevState,
          lastSelectedNode: key
        }));
      } else {
        setExpanded(prevState => ({
          ...prevState,
          [key]:
            !prevState[key] || prevState.lastSelectedNode === key
              ? !prevState[key]
              : prevState[key],
          lastSelectedNode: key
        }));
      }
    }, []);

    // Recalculate graph layout if graph container size changes
    useEffect(() => {
      if (graphElement.current?.parentElement) {
        new ResizeSensor(graphElement.current.parentElement, function() {
          setParentWidth(graphElement.current?.parentElement?.clientWidth ?? 0);
          setLayout(getGraphLayout());
        });
      }
    }, [getGraphLayout]);

    // Recalculate graph layout if a node is expanded
    useEffect(() => {
      setLayout(getGraphLayout());
    }, [pathway, expanded, getGraphLayout]);

    return (
      <GraphMemo
        graphElement={graphElement}
        interactive={interactive}
        maxHeight={maxHeight}
        nodeCoordinates={nodeCoordinates}
        edges={edges}
        pathway={pathway}
        nodeRefs={nodeRefs}
        parentWidth={parentWidth}
        maxWidth={maxWidth}
        expanded={expanded}
        toggleExpanded={toggleExpanded}
        currentNode={currentNode}
      />
    );
  }
);

interface GraphMemoProps {
  graphElement: RefObject<HTMLDivElement>;
  interactive: boolean;
  maxHeight: number;
  nodeCoordinates: NodeCoordinates;
  edges: Edges;
  pathway: Pathway;
  nodeRefs: React.MutableRefObject<{
    [key: string]: HTMLDivElement;
  }>;
  parentWidth: number;
  maxWidth: number;
  expanded: ExpandedState;
  toggleExpanded: (key: string) => void;
  currentNode: State;
}

const areEqual = (prevProps: GraphMemoProps, nextProps: GraphMemoProps) => {
  if (prevProps.graphElement !== nextProps.graphElement) return false;
  if (prevProps.interactive !== nextProps.interactive) return false;
  if (prevProps.maxHeight !== nextProps.maxHeight) return false;
  if (prevProps.pathway !== nextProps.pathway) return false;
  if (prevProps.nodeRefs !== nextProps.nodeRefs) return false;
  if (prevProps.parentWidth !== nextProps.parentWidth) return false;
  if (prevProps.maxWidth !== nextProps.maxWidth) return false;
  if (prevProps.expanded !== nextProps.expanded) return false;
  if (prevProps.toggleExpanded !== nextProps.toggleExpanded) return false;
  if (prevProps.currentNode !== nextProps.currentNode) return false;

  // Check if nodeCoordinates have same values but different object
  if (prevProps.nodeCoordinates !== nextProps.nodeCoordinates) {
    Object.keys(prevProps.nodeCoordinates).forEach(nodeKey => {
      if (!(nodeKey in nextProps.nodeCoordinates)) return false;

      let prevCoordinate = prevProps.nodeCoordinates[nodeKey];
      let nextCoordinate = nextProps.nodeCoordinates[nodeKey];
      if (prevCoordinate.x !== nextCoordinate.x) return false;
      if (prevCoordinate.y !== nextCoordinate.y) return false;
      if (prevCoordinate.width !== nextCoordinate.width) return false;
    });
  }

  // Check if edges have same values but different object
  if (prevProps.edges !== nextProps.edges) {
    Object.keys(prevProps.edges).forEach(edgeKey => {
      if (!(edgeKey in nextProps.edges)) return false;

      let prevEdge = prevProps.edges[edgeKey];
      let nextEdge = nextProps.edges[edgeKey];
      if (prevEdge.start !== nextEdge.start) return false;
      if (prevEdge.end !== nextEdge.end) return false;
      if (prevEdge.label !== nextEdge.label) return false;
      if (prevEdge.points !== nextEdge.points) return false;
    });
  }

  return true;
};

const GraphMemo: FC<GraphMemoProps> = memo(
  ({
    graphElement,
    interactive,
    maxHeight,
    nodeCoordinates,
    edges,
    pathway,
    nodeRefs,
    parentWidth,
    maxWidth,
    expanded,
    toggleExpanded,
    currentNode
  }) => {
    const { id: pathwayId } = useParams();
    const history = useHistory();
    const redirectToNode = useCallback(
      nodeId => {
        const url = `/builder/${encodeURIComponent(pathwayId)}/node/${encodeURIComponent(nodeId)}`;
        if (url !== history.location.pathname) {
          history.push(url);
        }
      },
      [history, pathwayId]
    );
    const onClickHandler = useCallback(
      (nodeName: string) => {
        if (interactive) {
          redirectToNode(nodeName);
          toggleExpanded(nodeName);
        }
      },
      [redirectToNode, toggleExpanded, interactive]
    );
    return (
      <div
        ref={graphElement}
        id="graph-root"
        className={styles.root}
        style={{
          height: interactive ? maxHeight + 150 : 'inherit',
          width: maxWidth + 'px',
          position: 'relative',
          marginRight: '5px'
        }}
      >
        {nodeCoordinates !== undefined
          ? Object.keys(nodeCoordinates).map(nodeName => {
              return (
                <Node
                  key={nodeName}
                  nodeKey={nodeName}
                  currentNodeKey={currentNode.key ?? ''}
                  ref={(node: HTMLDivElement): void => {
                    if (node) nodeRefs.current[nodeName] = node;
                    else delete nodeRefs.current[nodeName];
                  }}
                  pathwayState={pathway.states[nodeName]}
                  xCoordinate={nodeCoordinates[nodeName].x + parentWidth / 2}
                  yCoordinate={nodeCoordinates[nodeName].y}
                  isTransitionOfCurrentBranch={
                    isBranchState(currentNode) &&
                    currentNode.transitions.some(e => e?.transition === nodeName)
                  }
                  expanded={Boolean(expanded[nodeName])}
                  onClick={onClickHandler}
                />
                // <TestComponent
                //   key={nodeName}
                //   nodeKey={nodeName}
                //   xCoordinate={nodeCoordinates[nodeName].x + parentWidth / 2}
                //   yCoordinate={nodeCoordinates[nodeName].y}
                // />
              );
            })
          : []}

        <svg
          xmlns="http://www.w3.org/2000/svg"
          style={{
            width: maxWidth,
            height: maxHeight,
            zIndex: 1,
            top: 0,
            left: 0,
            overflow: 'visible'
          }}
        >
          {edges !== undefined
            ? Object.keys(edges).map(edgeName => {
                const edge = edges[edgeName];
                return (
                  <Arrow
                    key={edgeName}
                    edge={edge}
                    edgeName={edgeName}
                    widthOffset={parentWidth / 2}
                    currentNode={currentNode}
                  />
                );
              })
            : []}
        </svg>
      </div>
    );
  },
  areEqual
);

export default Graph;

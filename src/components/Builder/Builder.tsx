import React, { FC, useRef, useEffect, memo } from 'react';
import { Pathway, State } from 'pathways-model';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import Header from 'components/Header';
import Navigation from 'components/Navigation';
import Sidebar from 'components/Sidebar';
import Graph from 'components/Graph';
import { useTheme } from 'components/ThemeProvider';

import styles from './Builder.module.scss';
import { useCurrentPathwayContext } from 'components/CurrentPathwayProvider';

interface BuilderProps {
  updatePathway: (pathway: Pathway) => void;
  currentNode: State;
}

const Builder: FC<BuilderProps> = ({ updatePathway, currentNode }) => {
  const { pathway } = useCurrentPathwayContext();
  const headerElement = useRef<HTMLDivElement>(null);
  const graphContainerElement = useRef<HTMLDivElement>(null);
  const theme = useTheme('dark');

  console.log(currentNode);

  // Set the height of the graph container
  useEffect(() => {
    if (graphContainerElement?.current && headerElement?.current)
      graphContainerElement.current.style.height =
        window.innerHeight - headerElement.current.clientHeight + 'px';
  }, [headerElement, graphContainerElement]);

  return (
    <>
      <div ref={headerElement}>
        <Header />
        <Navigation />
      </div>

      {pathway && (
        <div className={styles.display}>
          <MuiThemeProvider theme={theme}>
            <Sidebar
              updatePathway={updatePathway}
              headerElement={headerElement}
              currentNode={currentNode}
            />
          </MuiThemeProvider>

          <div ref={graphContainerElement} className={styles.graph}>
            <Graph currentNode={currentNode} />
          </div>
        </div>
      )}
    </>
  );
};

export default memo(Builder);

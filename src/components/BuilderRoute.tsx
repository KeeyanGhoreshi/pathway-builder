import React, { FC, memo, useMemo, useCallback, useEffect } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Pathway } from 'pathways-model';

import Builder from 'components/Builder';
import { usePathwayContext } from 'components/PathwayProvider';
import { useCurrentPathwayContext } from './CurrentPathwayProvider';
import { useCurrentNodeContext } from './CurrentNodeProvider';

const BuilderRoute: FC = () => {
  const { id, nodeId } = useParams();
  const { pathways, updatePathwayAtIndex } = usePathwayContext();
  const { setPathway } = useCurrentPathwayContext();
  const { setCurrentNode } = useCurrentNodeContext();
  const pathwayId = decodeURIComponent(id);
  const pathwayIndex = useMemo(() => pathways.findIndex(pathway => pathway.id === pathwayId), [
    pathwayId,
    pathways
  ]);
  const pathway = pathways[pathwayIndex];
  const currentNode = pathway?.states?.[decodeURIComponent(nodeId)];

  const updatePathway = useCallback(
    (pathway: Pathway) => {
      setPathway(pathway);
      updatePathwayAtIndex(pathway, pathwayIndex);
    },
    [pathwayIndex, updatePathwayAtIndex, setPathway]
  );

  useEffect(() => {
    setPathway(pathway);
  }, [pathway, setPathway]);

  useEffect(() => {
    setCurrentNode(currentNode);
  }, [currentNode, setCurrentNode]);

  if (pathway == null) return null;
  if (currentNode == null) return <Redirect to={`/builder/${id}/node/Start`} />;

  return <Builder updatePathway={updatePathway} />;
};

export default memo(BuilderRoute);

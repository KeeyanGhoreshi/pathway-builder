import React, { FC, memo, useMemo, useCallback } from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { Pathway } from 'pathways-model';

import Builder from 'components/Builder';
import { usePathwayContext } from 'components/PathwayProvider';
import { useCurrentPathwayContext } from './CurrentPathwayProvider';

const BuilderRoute: FC = () => {
  const { id, nodeId } = useParams();
  const { pathways, updatePathwayAtIndex } = usePathwayContext();
  const { setPathway } = useCurrentPathwayContext();
  const pathwayId = decodeURIComponent(id);
  const pathwayIndex = useMemo(() => pathways.findIndex(pathway => pathway.id === pathwayId), [
    pathwayId,
    pathways
  ]);
  const pathway = pathways[pathwayIndex];
  const currentNode = pathway?.states?.[decodeURIComponent(nodeId)];

  const updatePathway = useCallback(
    (pathway: Pathway) => {
      updatePathwayAtIndex(pathway, pathwayIndex);
    },
    [pathwayIndex, updatePathwayAtIndex]
  );

  if (pathway == null) return null;
  if (currentNode == null) return <Redirect to={`/builder/${id}/node/Start`} />;

  setPathway(pathway);

  return <Builder updatePathway={updatePathway} currentNode={currentNode} />;
};

export default memo(BuilderRoute);

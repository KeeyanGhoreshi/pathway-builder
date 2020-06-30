import React, { FC, memo, useEffect } from 'react';

interface props {
  nodeKey: string;
  xCoordinate: number;
  yCoordinate: number;
}

const areEqual = (prevProps: props, nextProps: props) => {
  return prevProps.nodeKey === nextProps.nodeKey;
};

const TestComponent: FC<props> = ({ nodeKey, xCoordinate, yCoordinate }) => {
  console.log(
    'Test Component Rendered! (' + nodeKey + ', ' + xCoordinate + ', ' + yCoordinate + ')'
  );

  useEffect(() => {
    console.log('Mounting ' + nodeKey);

    return () => console.log('Unmounting ' + nodeKey);
  }, []);

  return <div>Hello world!</div>;
};

export default memo(TestComponent, areEqual);

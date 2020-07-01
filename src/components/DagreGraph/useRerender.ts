import { useCallback, useState } from 'react';

const useRerender = (): (() => void) => {
  const [, setState] = useState(0);
  const rerender = useCallback(() => {
    setState(current => (current + 1) % 2);
  }, []);
  return rerender;
};

export default useRerender;

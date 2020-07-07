import { useEffect, useRef, useState, MutableRefObject } from 'react';

function useRefState<T>(initialValue: T): [T, MutableRefObject<T>, (value: T) => void] {
  const [state, setState] = useState<T>(initialValue);
  const stateRef = useRef(state);
  useEffect(() => {
    console.log('updating ref state');
    console.log(state);
    stateRef.current = state;
  }, [state]);
  return [state, stateRef, setState];
}

export default useRefState;

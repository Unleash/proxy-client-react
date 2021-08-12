import { useContext } from 'react';
import FlagContext from './FlagContext';

const useUnleashContext = () => {
  const { updateContext } = useContext(FlagContext);

  return updateContext;
};

export default useUnleashContext;

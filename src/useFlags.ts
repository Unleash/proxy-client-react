import { useContext } from 'react';
import FlagContext from './FlagContext';

const useFlags = () => {
  const { client } = useContext(FlagContext);

  return client.getAllToggles();
};

export default useFlags;

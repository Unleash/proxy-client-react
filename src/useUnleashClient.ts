/** @format */

import { useContext } from 'react';
import FlagContext from './FlagContext';

const useUnleashClient = () => {
  const { client } = useContext(FlagContext);
  return client;
};

export default useUnleashClient;

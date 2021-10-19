import { useState, useEffect, useContext } from 'react';
import FlagContext from './FlagContext';

const useFlagsReady = () => {
  const { client } = useContext(FlagContext);
  const [flagsReady, setFlagsReady] = useState(false)

  useEffect(() => {
    if (!client) return;

    client.on('ready', () => {
      setFlagsReady(true);
    });
  }, [client]);

  return flagsReady;
};

export default useFlagsReady;


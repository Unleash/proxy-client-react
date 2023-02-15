import { useContext, useEffect, useState } from 'react';
import FlagContext from './FlagContext';

const useFlags = () => {
  const { client } = useContext(FlagContext);
  const [flags, setFlags] = useState(client.getAllToggles());

  useEffect(() => {
    const onUpdate = () => {
      setFlags(client.getAllToggles());
    };

    client.on('update', onUpdate);

    return () => {
      client.off('update', onUpdate);
    };
  }, []);

  return flags;
};

export default useFlags;

import { useContext, useEffect, useState } from 'react';
import FlagContext from './FlagContext';

const useFlag = (name: string) => {
  const { isEnabled, client } = useContext(FlagContext);
  const [flag, setFlag] = useState(isEnabled(name));

  useEffect(() => {
    if (!client) return;
    client.on('update', () => {
      const enabled = isEnabled(name);
      setFlag(enabled);
    });

    client.on('ready', () => {
      const enabled = isEnabled(name);
      setFlag(enabled);
    });
  }, [client]);

  return flag;
};

export default useFlag;

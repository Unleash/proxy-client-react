import { useContext, useEffect, useState, useRef } from 'react';
import FlagContext from './FlagContext';

const useFlag = (name: string) => {
  const { isEnabled, client } = useContext(FlagContext);
  const [flag, setFlag] = useState(!!isEnabled(name));
  const flagRef = useRef<typeof flag>();
  flagRef.current = flag;

  useEffect(() => {
    if (!client) return;

    const updateHandler = () => {
      const enabled = isEnabled(name);
      if (enabled !== flagRef.current) {
        flagRef.current = enabled;
        setFlag(!!enabled);
      }
    };

    const readyHandler = () => {
      const enabled = isEnabled(name);
      flagRef.current = enabled;
      setFlag(enabled);
    };

    client.on('update', updateHandler);
    client.on('ready', readyHandler);

    () => {
      client.off('update', updateHandler);
      client.off('ready', readyHandler);
    };
  }, [client]);

  return flag;
};

export default useFlag;

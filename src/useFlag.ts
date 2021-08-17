import { useContext, useEffect, useState, useRef } from 'react';
import FlagContext from './FlagContext';

const useFlag = (name: string) => {
  const { isEnabled, client } = useContext(FlagContext);
  const [flag, setFlag] = useState(!!isEnabled(name));
  const flagRef = useRef<any>();
  flagRef.current = flag;

  useEffect(() => {
    if (!client) return;
    client.on('update', () => {
      const enabled = isEnabled(name);
      if (enabled !== flagRef.current) {
        flagRef.current = enabled;
        setFlag(!!enabled);
      }
    });

    client.on('ready', () => {
      const enabled = isEnabled(name);
      setFlag(enabled);
    });
  }, [client]);

  return flag;
};

export default useFlag;

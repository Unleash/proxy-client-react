import { useContext, useState, useEffect } from 'react';
import FlagContext from './FlagContext';

const useVariant = (name: string) => {
  const { getVariant, client } = useContext(FlagContext);

  const [variant, setVariant] = useState(getVariant(name));

  useEffect(() => {
    if (!client) return;
    client.on('update', () => {
      const newVariant = getVariant(name);
      if (
        variant.name !== newVariant.name ||
        variant.enabled !== newVariant.enabled
      ) {
        setVariant(variant);
      }
    });

    client.on('ready', () => {
      const variant = getVariant(name);
      setVariant(variant);
    });
  }, [client]);

  return variant;
};

export default useVariant;

import { useContext, useState, useEffect, useRef } from 'react';
import { IVariant } from 'unleash-proxy-client';
import FlagContext from './FlagContext';

const useVariant = (name: string): Partial<IVariant> => {
  const { getVariant, client } = useContext(FlagContext);

  const [variant, setVariant] = useState(getVariant(name));
  const variantRef = useRef<typeof variant>();
  variantRef.current = variant;

  useEffect(() => {
    if (!client) return;
    client.on('update', () => {
      const newVariant = getVariant(name);
      if (
        variantRef.current.name !== newVariant.name ||
        variantRef.current.enabled !== newVariant.enabled
      ) {
        setVariant(newVariant);
        variantRef.current = newVariant;
      }
    });

    client.on('ready', () => {
      const variant = getVariant(name);
      setVariant(variant);
    });
  }, [client]);

  return variant || {};
};

export default useVariant;

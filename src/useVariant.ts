import { useContext, useState, useEffect, useRef } from 'react';
import { IVariant } from 'unleash-proxy-client';
import FlagContext from './FlagContext';

export const variantHasChanged = (
    oldVariant: IVariant,
    newVariant?: IVariant,
): boolean => {
    const variantsAreEqual =
        oldVariant.name === newVariant?.name &&
        oldVariant.enabled === newVariant?.enabled &&
        oldVariant.payload?.type === newVariant?.payload?.type &&
        oldVariant.payload?.value === newVariant?.payload?.value;

    return !variantsAreEqual;
};

const useVariant = (name: string): Partial<IVariant> => {
  const { getVariant, client } = useContext(FlagContext);

  const [variant, setVariant] = useState(getVariant(name));
  const variantRef = useRef<typeof variant>({
    name: variant.name,
    enabled: variant.enabled,
  });
  variantRef.current = variant;

  useEffect(() => {
    if (!client) return;

    const updateHandler = () => {
      const newVariant = getVariant(name);
      if (variantHasChanged(variantRef.current, newVariant)) {
        setVariant(newVariant);
        variantRef.current = newVariant;
      }
    };

    const readyHandler = () => {
      const variant = getVariant(name);
      variantRef.current.name = variant?.name;
      variantRef.current.enabled = variant?.enabled;
      setVariant(variant);
    };

    client.on('update', updateHandler);
    client.on('ready', readyHandler);

    return () => {
      client.off('update', updateHandler);
      client.off('ready', readyHandler);
    };
  }, [client]);

  return variant || {};
};

export default useVariant;

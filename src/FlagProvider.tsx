import * as React from 'react';
import FlagContext from './FlagContext';
import { UnleashClient, IConfig, IContext } from 'unleash-proxy-client';

interface IFlagProvider {
  config: IConfig;
}

const FlagProvider: React.FC<IFlagProvider> = ({ config, children }) => {
  const client = React.useMemo(() => {
    const client = new UnleashClient(config);
    client.start();
    return client;
  }, []);

  const updateContext = async (context: IContext): Promise<void> => {
    await client.updateContext(context);
  };

  const isEnabled = (name: string) => {
    return client.isEnabled(name);
  };

  const getVariant = (name: string) => {
    return client.getVariant(name);
  };

  const on = (...args:Parameters<typeof client.on>) => {
    return client.on(...args);
  };

  const context = { on, updateContext, isEnabled, getVariant, client };
  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

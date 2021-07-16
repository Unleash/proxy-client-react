import * as React from 'react';
import FlagContext from './FlagContext';
import { UnleashClient } from 'unleash-proxy-client';

interface IFlagProvider {
  config: IConfig;
}

interface IContext {
  [index: string]: any;
}

interface IConfig {
  url: string;
  clientKey: string;
  appName: string;
  storage: IStorage;
}

interface IStorage {
  save: (name: string, data: any) => void;
  get: (name: string) => any;
}

const FlagProvider: React.FC<IFlagProvider> = ({ config, children }) => {
  const client = new UnleashClient(config);
  client.start();

  const updateContext = (context: IContext) => {
    if (!client) return;
    client.updateContext(context);
  };

  const isEnabled = (name: string) => {
    if (!client) return;
    return client.isEnabled(name);
  };

  const getVariant = (name: string) => {
    if (!client) return;
    return client.getVariant(name);
  };

  const context = { updateContext, isEnabled, getVariant, client };
  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

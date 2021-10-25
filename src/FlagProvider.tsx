import * as React from 'react';
import FlagContext from './FlagContext';
// @ts-ignore
// ignore typings for the pure unleash-proxy-client library
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
  const [client, setClient] = React.useState(null);
  const functionCalls = React.useRef<any>();
  functionCalls.current = [];

  React.useEffect(() => {
    const client = new UnleashClient(config);
    client.start();

    functionCalls.current.forEach((call: any) => {
      call(client);
    }, []);

    functionCalls.current = [];

    setClient(client);
  }, []);

  const updateContext = (context: IContext) => {
    if (!client) {
      deferCall((client: any) => client.updateContext(context));
      return;
    }
    client.updateContext(context);
  };

  const deferCall = (callback: (client: any) => void) => {
    functionCalls.current.push(callback);
  };

  const isEnabled = (name: string) => {
    if (!client) {
      deferCall((client: any) => client.isEnabled(name));
      return;
    }
    return client.isEnabled(name);
  };

  const getVariant = (name: string) => {
    if (!client) {
      deferCall((client: any) => client.getVariant(name));
      return;
    }
    return client.getVariant(name);
  };

  const context = { updateContext, isEnabled, getVariant, client };
  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

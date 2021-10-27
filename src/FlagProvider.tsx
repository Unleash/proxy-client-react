import * as React from 'react';
import FlagContext from './FlagContext';
import { UnleashClient, IConfig, IContext } from 'unleash-proxy-client';

interface IFlagProvider {
  config: IConfig;
}

const FlagProvider: React.FC<IFlagProvider> = ({ config, children }) => {
  const [client, setClient] = React.useState(null);
  const functionCalls = React.useRef<any>();
  functionCalls.current = [];

  React.useEffect(() => {
    const client = new UnleashClient(config);

    functionCalls.current.forEach((call: any) => {
      call(client);
    }, []);

    functionCalls.current = [];

    setClient(client);

    client.start();
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
      return {};
    }
    return client.getVariant(name);
  };

  const on = (event:string, ...args:any[]) => {
    if (!client) {
      deferCall((client: any) => client.on(event,...args));
      return;
    }
    return client.on(event, ...args);
  };

  const context = { on, updateContext, isEnabled, getVariant, client };
  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

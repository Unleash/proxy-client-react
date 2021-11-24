import React, { useEffect, useRef } from 'react';
import { UnleashClient, IConfig, IContext } from 'unleash-proxy-client';
import FlagContext from './FlagContext';

interface IFlagProvider {
  config: IConfig;
  client?: UnleashClient;
}

const FlagProvider: React.FC<IFlagProvider> = (props) => {
  const client = useRef<UnleashClient>(props.client);

  if (!client.current) {
    client.current = new UnleashClient(props.config);

    if (Array.isArray(props.config.bootstrap)) {
      // @ts-ignore: Toogles should be set synchronously for proper SSR support
      client.current.toggles = props.config.bootstrap;
    }
  }

  useEffect(() => {
    client.current.start();
  }, []);

  const updateContext = async (context: IContext): Promise<void> => {
    await client.current.updateContext(context);
  };

  const isEnabled = (name: string) => {
    return client.current.isEnabled(name);
  };

  const getVariant = (name: string) => {
    return client.current.getVariant(name);
  };

  const on = (event: string, ...args: any[]) => {
    return client.current.on(event, ...args);
  };

  const context = { on, updateContext, isEnabled, getVariant, client: client.current };

  return <FlagContext.Provider value={context}>{props.children}</FlagContext.Provider>;
};

export default FlagProvider;

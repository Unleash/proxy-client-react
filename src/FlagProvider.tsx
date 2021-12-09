/** @format */

import * as React from 'react';
import FlagContext from './FlagContext';
import { UnleashClient, IConfig, IContext } from 'unleash-proxy-client';

type eventArgs = [Function, any];

interface IFlagProvider {
  config?: IConfig;
  unleashClient?: UnleashClient;
}

const FlagProvider: React.FC<IFlagProvider> = ({
  config,
  children,
  unleashClient,
}) => {
  const client = React.useRef<UnleashClient>(unleashClient);

  if (!client.current) {
    client.current = new UnleashClient(config);
  }

  React.useEffect(() => {
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

  const on = (event: string, ...args: eventArgs) => {
    return client.current.on(event, ...args);
  };

  const context = {
    on,
    updateContext,
    isEnabled,
    getVariant,
    client: client.current,
  };

  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

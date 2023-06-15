/** @format */

import * as React from 'react';
import { IConfig, UnleashClient } from 'unleash-proxy-client';
import FlagContext, { IFlagContextValue } from './FlagContext';

export interface IFlagProvider {
  config?: IConfig;
  unleashClient?: UnleashClient;
  startClient?: boolean;
}

const offlineConfig: IConfig = {
  bootstrap: [],
  disableRefresh: true,
  disableMetrics: true,
  url: 'http://localhost',
  appName: 'offline',
  clientKey: 'not-used',
};

const FlagProvider: React.FC<React.PropsWithChildren<IFlagProvider>> = ({
  config: customConfig,
  children,
  unleashClient,
  startClient = true,
}) => {
  const config = customConfig || offlineConfig;
  const client = React.useRef<UnleashClient>(
    unleashClient || new UnleashClient(config)
  );
  const [flagsReady, setFlagsReady] = React.useState(
    Boolean(
      unleashClient
        ? customConfig?.bootstrap && customConfig?.bootstrapOverride !== false
        : config.bootstrap && config.bootstrapOverride !== false
    )
  );
  const [flagsError, setFlagsError] = React.useState(null);

  React.useEffect(() => {
    if (!config && !unleashClient) {
      console.error(
        `You must provide either a config or an unleash client to the flag provider.
        If you are initializing the client in useEffect, you can avoid this warning
        by checking if the client exists before rendering.`
      );
    }

    const errorCallback = (e: any) => {
      setFlagsError((currentError) => currentError || e);
    };

    let timeout: any;
    const readyCallback = () => {
      // wait for flags to resolve after useFlag gets the same event
      timeout = setTimeout(() => {
        setFlagsReady(true);
      }, 0);
    };

    client.current.on('ready', readyCallback);
    client.current.on('error', errorCallback);

    const shouldStartClient = startClient || !unleashClient;
    if (shouldStartClient) {
      // defensively stop the client first
      client.current.stop();
      // start the client
      client.current.start();
    }

    // stop unleash client on unmount
    return function cleanup() {
      if (client.current) {
        client.current.off('error', errorCallback);
        client.current.off('ready', readyCallback);
        client.current.stop();
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const updateContext: IFlagContextValue['updateContext'] = async (context) => {
    await client.current.updateContext(context);
  };

  const isEnabled: IFlagContextValue['isEnabled'] = (toggleName) => {
    return client.current.isEnabled(toggleName);
  };

  const getVariant: IFlagContextValue['getVariant'] = (toggleName) => {
    return client.current.getVariant(toggleName);
  };

  const on: IFlagContextValue['on'] = (event, callback, ctx) => {
    return client.current.on(event, callback, ctx);
  };

  const context = React.useMemo<IFlagContextValue>(
    () => ({
      on,
      updateContext,
      isEnabled,
      getVariant,
      client: client.current,
      flagsReady,
      flagsError,
      setFlagsReady,
      setFlagsError,
    }),
    [flagsReady, flagsError]
  );

  return (
    <FlagContext.Provider value={context}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

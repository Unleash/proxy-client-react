/** @format */

import * as React from 'react';
import { IConfig, UnleashClient } from 'unleash-proxy-client';
import FlagContext, { IFlagContextValue } from './FlagContext';

export interface IFlagProvider {
  config?: IConfig;
  unleashClient?: UnleashClient;
  startClient?: boolean;
}

const offlineConfig = {
  bootstrap: [],
  disableRefresh: true,
  disableMetrics: true,
  url: 'http://localhost',
  appName: 'offline',
  clientKey: 'not-used',
};

const FlagProvider: React.FC<React.PropsWithChildren<IFlagProvider>> = ({
  config,
  children,
  unleashClient,
  startClient = true,
}) => {
  const client = React.useRef<UnleashClient>(
    unleashClient || new UnleashClient(config || offlineConfig)
  );
  const [flagsReady, setFlagsReady] = React.useState(false);
  const [flagsError, setFlagsError] = React.useState(null);
  const flagsErrorRef = React.useRef(null);

  React.useEffect(() => {
    if (!config && !unleashClient) {
      console.error(
        `You must provide either a config or an unleash client to the flag provider.
        If you are initializing the client in useEffect, you can avoid this warning
        by checking if the client exists before rendering.`
      );
    }

    const errorCallback = (e: any) => {
      // Use a ref because regular event handlers are closing over state with stale values:
      flagsErrorRef.current = e;

      if (flagsErrorRef.current === null) {
        setFlagsError(e);
      }
    };
    const readyCallback = () => {
      setFlagsReady(true);
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

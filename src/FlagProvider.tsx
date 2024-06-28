/** @format */

import React, { type FC, type PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { type IConfig, UnleashClient } from 'unleash-proxy-client';
import FlagContext, { type IFlagContextValue } from './FlagContext';

export interface IFlagProvider {
  config?: IConfig;
  unleashClient?: UnleashClient;
  startClient?: boolean;
  stopClient?: boolean;
}

const offlineConfig: IConfig = {
  bootstrap: [],
  disableRefresh: true,
  disableMetrics: true,
  url: 'http://localhost',
  appName: 'offline',
  clientKey: 'not-used',
};

// save startTransition as var to avoid webpack analysis (https://github.com/webpack/webpack/issues/14814)
const _startTransition = 'startTransition';
// fallback for React <18 which doesn't support startTransition
const startTransition = React[_startTransition] || (fn => fn());

const FlagProvider: FC<PropsWithChildren<IFlagProvider>> = ({
  config: customConfig,
  children,
  unleashClient,
  startClient = true,
  stopClient = true,
}) => {
  const config = customConfig || offlineConfig;
  const client = React.useRef<UnleashClient>(
    unleashClient || new UnleashClient(config)
  );
  const [flagsReady, setFlagsReady] = React.useState(
    Boolean(
      unleashClient
        ? (customConfig?.bootstrap && customConfig?.bootstrapOverride !== false) || unleashClient.isReady?.()
        : config.bootstrap && config.bootstrapOverride !== false
    )
  );
  const [flagsError, setFlagsError] = useState(client.current.getError?.() || null);

  useEffect(() => {
    if (!config && !unleashClient) {
      console.error(
        `You must provide either a config or an unleash client to the flag provider.
        If you are initializing the client in useEffect, you can avoid this warning
        by checking if the client exists before rendering.`
      );
    }

    const errorCallback = (e: any) => {
      startTransition(() => {
        setFlagsError((currentError: any) => currentError || e);
      });
    };

    const clearErrorCallback = (e: any) => {
      startTransition(() => {
        setFlagsError(null);
      });
    }

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const readyCallback = () => {
      // wait for flags to resolve after useFlag gets the same event
      timeout = setTimeout(() => {
        startTransition(() => {
          setFlagsReady(true);
        });
      }, 0);
    };

    client.current.on('ready', readyCallback);
    client.current.on('error', errorCallback);
    client.current.on('recovered', clearErrorCallback);

    if (startClient) {
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
        client.current.off('recovered', clearErrorCallback);
        if (stopClient) {
          client.current.stop();
        }
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  const context = useMemo<IFlagContextValue>(
    () => ({
      on: ((event, callback, ctx) => client.current.on(event, callback, ctx)) as IFlagContextValue['on'],
      off: ((event, callback) => client.current.off(event, callback)) as IFlagContextValue['off'],
      updateContext: async (context) => await client.current.updateContext(context),
      isEnabled: (toggleName) => client.current.isEnabled(toggleName),
      getVariant: (toggleName) => client.current.getVariant(toggleName),
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

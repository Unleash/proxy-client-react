/** @format */

import React, { type FC, type PropsWithChildren, useCallback, useEffect, useMemo, useState } from 'react';
import { type IConfig, IMutableContext, UnleashClient } from 'unleash-proxy-client';
import FlagContext, { type IFlagContextValue } from './FlagContext';

export interface IFlagProvider {
  config?: IConfig;
  unleashClient?: UnleashClient;
  startClient?: boolean;
  stopClient?: boolean;
  startTransition?: (fn: () => void) => void;
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
// Fallback for React <18 and exclude startTransition if in React Native
const defaultStartTransition = React[_startTransition] || (fn => fn());

const FlagProvider: FC<PropsWithChildren<IFlagProvider>> = ({
  config: customConfig,
  children,
  unleashClient,
  startClient = true,
  stopClient = true,
  startTransition = defaultStartTransition
}) => {
  const config = customConfig || offlineConfig;
  const client = React.useRef<UnleashClient>(
    unleashClient || new UnleashClient(config)
  );

  useEffect(() => {
    if (startClient) {
      // defensively stop the client first
      client.current.stop();
      client.current.start();
    }

    // stop unleash client on unmount
    return function cleanup() {
      if (stopClient) {
        client.current.stop();
      }
    };
  }, []);

  const value = useMemo(
    () => ({
      on: ((...args) => client.current.on(...args)) as IFlagContextValue['on'],
      off: ((...args) => client.current.off(...args)) as IFlagContextValue['off'],
      updateContext:  (async(...args) => await client.current.updateContext(...args)) as IFlagContextValue['updateContext'],
      isEnabled: ((...args) => client.current.isEnabled(...args)) as IFlagContextValue['isEnabled'],
      getVariant: ((...args) => client.current.getVariant(...args)) as IFlagContextValue['getVariant'],

      client: client.current,
      isInitiallyReady: Boolean(
        unleashClient
          ? (customConfig?.bootstrap &&
              customConfig?.bootstrapOverride !== false) ||
              unleashClient.isReady?.()
          : config.bootstrap && config.bootstrapOverride !== false
      ),
      startTransition,
    }),
    []
  );

  return (
    <FlagContext.Provider value={value}>{children}</FlagContext.Provider>
  );
};

export default FlagProvider;

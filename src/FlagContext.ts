import React, { type startTransition } from 'react';
import type { UnleashClient } from 'unleash-proxy-client';

export interface IFlagContextValue
  extends Pick<
    UnleashClient,
    'on' | 'off' | 'updateContext' | 'isEnabled' | 'getVariant'
  > {
  client: UnleashClient;
  isInitiallyReady: boolean;
  startTransition: typeof startTransition;
}

const FlagContext = React.createContext<IFlagContextValue | null>(null);

export default FlagContext;

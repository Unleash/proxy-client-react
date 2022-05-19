import React from 'react';
import type { UnleashClient } from 'unleash-proxy-client';

type eventArgs = [Function, any];

export interface IFlagContextValue {
  on(event: string, ...args: eventArgs): UnleashClient;
}

const FlagContext = React.createContext<IFlagContextValue>(null as never);

export default FlagContext;

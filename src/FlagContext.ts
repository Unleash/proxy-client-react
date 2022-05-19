import React from 'react';
import type { IContext, UnleashClient } from 'unleash-proxy-client';

type eventArgs = [Function, any];

export interface IFlagContextValue {
  on(event: string, ...args: eventArgs): UnleashClient;
  updateContext(context: IContext): Promise<void>;
  isEnabled(name: string): boolean;
  client: UnleashClient;
  flagsReady: boolean;
  setFlagsReady: React.Dispatch<
    React.SetStateAction<IFlagContextValue['flagsReady']>
  >;
  flagsError: any;
  setFlagsError: React.Dispatch<
    React.SetStateAction<IFlagContextValue['flagsError']>
  >;
}

const FlagContext = React.createContext<IFlagContextValue>(null as never);

export default FlagContext;

import React from 'react';
import type { UnleashClient } from 'unleash-proxy-client';

export interface IFlagContextValue
  extends Pick<
    UnleashClient,
    'on' | 'off' | 'updateContext' | 'isEnabled' | 'getVariant'
  > {
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

const FlagContext = React.createContext<IFlagContextValue | null>(null);

export default FlagContext;

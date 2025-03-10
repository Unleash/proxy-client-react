import { useContext } from 'react';
import FlagContext, { IFlagContextValue } from './FlagContext';
import { UnleashClient } from 'unleash-proxy-client';

const noopOn = (event: string, callback: Function, ctx?: any): UnleashClient => {
  console.error('This hook must be used within a FlagProvider');
  return mockUnleashClient;
};

const noopOff = (event: string, callback?: Function): UnleashClient => {
  console.error('This hook must be used within a FlagProvider');
  return mockUnleashClient;
};

const mockUnleashClient = {
  on: noopOn,
  off: noopOff,
  updateContext: async () => {
    console.error('This hook must be used within a FlagProvider');
    return undefined;
  },
  isEnabled: () => {
    console.error('This hook must be used within a FlagProvider');
    return false;
  },
  getVariant: () => {
    console.error('This hook must be used within a FlagProvider');
    return { name: 'disabled', enabled: false };
  },
  toggles: [],
  impressionDataAll: {},
  context: {},
  storage: {},
  start: () => {},
  stop: () => {},
  isReady: () => false,
  getError: () => null,
  getAllToggles: () => [],
} as unknown as UnleashClient;

// Create a default context value
const defaultContextValue: IFlagContextValue = {
  on: noopOn,
  off: noopOff,
  updateContext: async () => {
    console.error('updateContext hook must be used within a FlagProvider');
    return undefined;
  },
  isEnabled: () => {
    console.error('isEnabled hook must be used within a FlagProvider');
    return false;
  },
  getVariant: () => {
    console.error('getVariant hook must be used within a FlagProvider');
    return { name: 'disabled', enabled: false };
  },
  client: mockUnleashClient,
  flagsReady: false,
  setFlagsReady: () => {
    console.error('setFlagsReady hook must be used within a FlagProvider');
  },
  flagsError: null,
  setFlagsError: () => {
    console.error('setFlagsError hook must be used within a FlagProvider');
  }
};

export function useFlagContext() {
  const context = useContext(FlagContext);
  if (!context) {
    console.error('useFlagContext hook must be used within a FlagProvider');
    return defaultContextValue;
  }
  return context;
}

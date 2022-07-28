/** @format */

export type {
  IConfig,
  IContext,
  IMutableContext,
  IVariant,
  IToggle,
} from 'unleash-proxy-client';
export {
  UnleashClient,
  IStorageProvider,
  LocalStorageProvider,
  InMemoryStorageProvider,
} from 'unleash-proxy-client';

import FlagContext from './FlagContext';
import FlagProvider from './FlagProvider';
import useFlag from './useFlag';
import useFlagsStatus from './useFlagsStatus';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';
import useUnleashClient from './useUnleashClient';

export {
  FlagContext,
  FlagProvider,
  useFlag,
  useFlagsStatus,
  useVariant,
  useUnleashContext,
  useUnleashClient,
};

export default FlagProvider;

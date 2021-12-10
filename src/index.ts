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

import FlagProvider from './FlagProvider';
import useFlag from './useFlag';
import useFlagsStatus from './useFlagsStatus';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';

export {
  FlagProvider,
  useFlag,
  useFlagsStatus,
  useVariant,
  useUnleashContext,
};

export default FlagProvider;

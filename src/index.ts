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
  type IStorageProvider,
  LocalStorageProvider,
  InMemoryStorageProvider,
} from 'unleash-proxy-client';

import FlagContext from './FlagContext';
import FlagProvider from './FlagProvider';
import useFlag from './useFlag';
import useFlags from './useFlags';
import useFlagsStatus from './useFlagsStatus';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';
import useUnleashClient from './useUnleashClient';

import { IFlagProvider } from './FlagProvider';

export {
  FlagContext,
  FlagProvider,
  useFlag,
  useFlags,
  useFlagsStatus,
  useVariant,
  useUnleashContext,
  useUnleashClient,
};

export type { IFlagProvider };

export default FlagProvider;

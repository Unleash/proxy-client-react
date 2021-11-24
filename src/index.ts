export type { IConfig } from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import FlagContext from './FlagContext';
import useFlag from './useFlag';
import useFlagsStatus from './useFlagsStatus';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';

export { FlagContext, FlagProvider, useFlag, useFlagsStatus, useVariant, useUnleashContext };

export default FlagProvider;

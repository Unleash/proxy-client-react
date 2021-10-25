export type { IConfig } from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import useFlag from './useFlag';
import useFlagsReady from './useFlagsReady';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';

export { FlagProvider, useFlag, useFlagsReady, useVariant, useUnleashContext };

export default FlagProvider;

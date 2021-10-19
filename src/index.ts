export type { IConfig } from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import useFlag from './useFlag';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';

export { FlagProvider, useFlag, useVariant, useUnleashContext };

export default FlagProvider;

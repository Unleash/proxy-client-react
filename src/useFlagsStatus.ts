/** @format */
import { useFlagContext } from './useFlagContext';

const useFlagsStatus = () => {
  const { flagsReady, flagsError } = useFlagContext();

  return { flagsReady, flagsError };
};

export default useFlagsStatus;

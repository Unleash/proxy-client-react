import { useFlagContext } from './useFlagContext';

const useUnleashContext = () => {
  const { updateContext } = useFlagContext();

  return updateContext;
};

export default useUnleashContext;

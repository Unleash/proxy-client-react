import { useFlagContext } from './useFlagContext';

const useUnleashClient = () => {
  const { client } = useFlagContext();
  return client;
};

export default useUnleashClient;

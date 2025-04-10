/** @format */
import { useEffect, useMemo, useState } from 'react';
import { useFlagContext } from './useFlagContext';

const useFlagsStatus = () => {
  const { client, isInitiallyReady, startTransition } = useFlagContext();
  const [flagsReady, setFlagsReady] = useState(isInitiallyReady || client.isReady());
  const [flagsError, setFlagsError] = useState(client.getError?.() || null);

  useEffect(() => {
    const errorCallback = (e: unknown) => {
      startTransition(() => {
        setFlagsError((currentError: unknown) => currentError || e);
      });
    };

    const clearErrorCallback = (e: unknown) => {
      startTransition(() => {
        setFlagsError(null);
      });
    };

    let timeout: ReturnType<typeof setTimeout> | null = null;
    const readyCallback = () => {
      // wait for flags to resolve after useFlag gets the same event
      timeout = setTimeout(() => {
        startTransition(() => {
          setFlagsReady(true);
        });
      }, 0);
    };

    client.on('ready', readyCallback);
    client.on('error', errorCallback);
    client.on('recovered', clearErrorCallback);

    return function cleanup() {
      if (client) {
        client.off('error', errorCallback);
        client.off('ready', readyCallback);
        client.off('recovered', clearErrorCallback);
      }
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  return useMemo(
    () => ({ flagsReady, flagsError, setFlagsReady, setFlagsError }),
    [flagsReady, flagsError]
  );
};

export default useFlagsStatus;

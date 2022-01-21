/** @format */

import { useState, useEffect, useContext } from 'react';
import { EVENTS } from 'unleash-proxy-client';

import FlagContext from './FlagContext';

const useFlagsStatus = () => {
  const { on, flagsReady, setFlagsReady, flagsError, setFlagsError } =
    useContext(FlagContext);

  useEffect(() => {
    on(EVENTS.READY, () => {
      setFlagsReady(true);
    });

    on(EVENTS.ERROR, (e: any) => {
      setFlagsError(e);
    });
  }, []);

  return { flagsReady, flagsError };
};

export default useFlagsStatus;

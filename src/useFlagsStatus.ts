/** @format */

import { useState, useEffect, useContext } from 'react';
import { EVENTS } from 'unleash-proxy-client';

import FlagContext from './FlagContext';

const useFlagsStatus = () => {
  const { flagsReady, flagsError } = useContext(FlagContext);

  return { flagsReady, flagsError };
};

export default useFlagsStatus;

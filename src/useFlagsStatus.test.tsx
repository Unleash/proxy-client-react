/** @format */

import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import { EVENTS } from 'unleash-proxy-client';

import useFlagsStatus from './useFlagsStatus';

const onMock = jest.fn();
const setFlagsReadyMock = jest.fn();
const setFlagsErrorMock = jest.fn();
const useContextSpy = jest.spyOn(React, 'useContext');

const mockValue = {
  on: onMock,
  setFlagsReady: setFlagsReadyMock,
  setFlagsError: setFlagsErrorMock,
  flagsReady: false,
  flagsError: null,
};

beforeEach(() => {
  onMock.mockClear();
  setFlagsReadyMock.mockClear();
  setFlagsErrorMock.mockClear();
});

test('should return flagReady false and flagsErrot null when no event received', () => {
  useContextSpy.mockReturnValue(mockValue);
  const { result } = renderHook(() => useFlagsStatus());

  expect(setFlagsReadyMock).toHaveBeenCalledTimes(0);
  expect(setFlagsErrorMock).toHaveBeenCalledTimes(0);
  expect(result.current).toStrictEqual({
    flagsReady: false,
    flagsError: null,
  });
  expect(onMock).toHaveBeenCalledTimes(2);
});

test('should return flagsReady true when received an READY event', () => {
  onMock.mockImplementation((event, cb) => {
    if (event === EVENTS.READY) {
      cb();
    }
  });
  useContextSpy.mockReturnValue(mockValue);

  renderHook(() => useFlagsStatus());
  expect(setFlagsReadyMock).toHaveBeenCalledTimes(1);
  expect(setFlagsErrorMock).toHaveBeenCalledTimes(0);
  expect(onMock).toHaveBeenCalledWith(EVENTS.READY, expect.any(Function));
});

test('should return flagError string when received an error event', () => {
  const givenError = new Error('Error');

  onMock.mockImplementation((event, cb) => {
    if (event === EVENTS.ERROR) {
      cb(givenError);
    }
  });
  useContextSpy.mockReturnValue(mockValue);
  renderHook(() => useFlagsStatus());

  expect(setFlagsReadyMock).toHaveBeenCalledTimes(0);
  expect(setFlagsErrorMock).toHaveBeenCalledTimes(1);
  expect(onMock).toHaveBeenCalledWith(EVENTS.ERROR, expect.any(Function));
});

import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import { EVENTS } from 'unleash-proxy-client';

import useFlagsStatus from './useFlagsStatus';

const onMock = jest.fn();
const useContextSpy = jest.spyOn(React, 'useContext');
const givenFlagName: string = 'Test';
const clientMock: any = {
  on: jest.fn(),
}

beforeEach(() => {
  onMock.mockClear();
})

test('should return flagReady false and flagsErrot null when no event received', () => {
  useContextSpy.mockReturnValue({ on: onMock });
  const { result } = renderHook(() => useFlagsStatus());

  expect(onMock).toHaveBeenCalledWith(EVENTS.READY, expect.any(Function))
  expect(onMock).toHaveBeenCalledWith(EVENTS.ERROR, expect.any(Function))
  expect(result.current).toStrictEqual({ flagsReady: false, flagsError: null });
  expect(onMock).toHaveBeenCalledTimes(2);
});

test('should return flagsReady true when received an READY event', () => {
    onMock.mockImplementation((event,cb) => {
        if (event === EVENTS.READY) {
            cb()
        }
    });
    useContextSpy.mockReturnValue({ on: onMock });
    const { result } = renderHook(() => useFlagsStatus());

    expect(result.current).toStrictEqual({ flagsReady: true, flagsError: null });
});

test('should return flagError string when received an error event', () => {
    const givenError = new Error('Error');

    onMock.mockImplementation((event,cb) => {
        if (event === EVENTS.ERROR) {
            cb(givenError)
        }
    });
    useContextSpy.mockReturnValue({ on: onMock });
    const { result } = renderHook(() => useFlagsStatus());

    expect(result.current).toStrictEqual({ flagsReady: false, flagsError: givenError });
});

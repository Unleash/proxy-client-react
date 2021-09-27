import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import useFlag from './useFlag';

const isEnabledMock = jest.fn()
const useContextSpy = jest.spyOn(React, 'useContext');
const givenFlagName: string = 'Test';
const clientMock: any = {
  on: jest.fn(),
}

beforeEach(() => {
  isEnabledMock.mockClear();
})

test('should return false when the flag is NOT enabled in context', () => {
  isEnabledMock.mockReturnValue(false);
  useContextSpy.mockReturnValue({ client: clientMock, isEnabled: isEnabledMock });
  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(result.current).toBe(false);
  expect(isEnabledMock).toHaveBeenCalledTimes(1);
});

test('should return true when the flag is enabled in context', () => {
  isEnabledMock.mockReturnValue(true);
  useContextSpy.mockReturnValue({ client: clientMock, isEnabled: isEnabledMock });
  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(result.current).toBe(true);
  expect(isEnabledMock).toHaveBeenCalledTimes(1);
});

test('should return true when the client is ready and re-call isEnabled', () => {
  isEnabledMock.mockReturnValue(true);
  useContextSpy.mockReturnValue({ client: clientMock, isEnabled: isEnabledMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'ready') {
      cb()
    }
  });

  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(result.current).toBe(true);
  expect(isEnabledMock).toHaveBeenCalledTimes(2);
});

test('should return true when the client is first false and is updated with true', () => {
  isEnabledMock.mockReturnValueOnce(false);
  isEnabledMock.mockReturnValueOnce(true);
  useContextSpy.mockReturnValue({ client: clientMock, isEnabled: isEnabledMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(result.current).toBe(true);
  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(isEnabledMock).toHaveBeenCalledTimes(3);
});

test('should set the local state only once', () => {
  isEnabledMock.mockReturnValueOnce(true);
  isEnabledMock.mockReturnValueOnce(true);
  useContextSpy.mockReturnValue({ client: clientMock, isEnabled: isEnabledMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(result.current).toBe(true);
  expect(isEnabledMock).toHaveBeenCalledTimes(2);
});

test('should NOT subscribe to ready or update if client does NOT exist', () => {
  clientMock.on.mockClear()
  isEnabledMock.mockReturnValueOnce(false);
  useContextSpy.mockReturnValue({ client: undefined, isEnabled: isEnabledMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useFlag(givenFlagName));

  expect(result.current).toBe(false);
  expect(clientMock.on).not.toHaveBeenCalled()
  expect(clientMock.on).not.toHaveBeenCalled()
  expect(isEnabledMock).toHaveBeenCalledTimes(1);
});

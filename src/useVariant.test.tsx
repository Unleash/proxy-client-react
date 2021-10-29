import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import useVariant from './useVariant';

const getVariantMock = jest.fn()
const useContextSpy = jest.spyOn(React, 'useContext');
const givenFlagName: string = 'Test';
const clientMock: any = {
  on: jest.fn(),
}
const givenVariantA = { name: 'A', enabled: true }
const givenVariantB = { name: 'B', enabled: true }
const givenVariantA_disabled = { name: 'A', enabled: false }

beforeEach(() => {
  getVariantMock.mockClear();
})

test('should return false when the flag is NOT enabled in context', () => {
  getVariantMock.mockReturnValue(givenVariantA);
  useContextSpy.mockReturnValue({ client: clientMock, getVariant: getVariantMock });
  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(result.current).toBe(givenVariantA);
  expect(getVariantMock).toHaveBeenCalledTimes(1);
});



test('should return variant when the client is ready and re-call getVariant', () => {
  getVariantMock.mockReturnValue(givenVariantA);
  useContextSpy.mockReturnValue({ client: clientMock, getVariant: getVariantMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'ready') {
      cb()
    }
  });

  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
  expect(result.current).toBe(givenVariantA);
  expect(getVariantMock).toHaveBeenCalledTimes(2);
});

test('should return `B` when the variant is first `A` and is updated with `B`', () => {
  getVariantMock.mockReturnValueOnce(givenVariantA);
  getVariantMock.mockReturnValueOnce(givenVariantB);
  useContextSpy.mockReturnValue({ client: clientMock, getVariant: getVariantMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(getVariantMock).toHaveBeenCalledTimes(3);
  expect(result.current).toBe(givenVariantB);
  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
});

test('should return `A` when the variant is first `A` and is updated with `A` disabled', () => {
  getVariantMock.mockReturnValueOnce(givenVariantA);
  getVariantMock.mockReturnValueOnce(givenVariantA_disabled);
  useContextSpy.mockReturnValue({ client: clientMock, getVariant: getVariantMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(getVariantMock).toHaveBeenCalledTimes(3);
  expect(result.current).toBe(givenVariantA_disabled);
  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
});

test('should return `A` and update the local state just once when the variant is the same', () => {
  getVariantMock.mockReturnValueOnce(givenVariantA);
  getVariantMock.mockReturnValueOnce(givenVariantA);
  useContextSpy.mockReturnValue({ client: clientMock, getVariant: getVariantMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(getVariantMock).toHaveBeenCalledTimes(2);
  expect(result.current).toBe(givenVariantA);
  expect(clientMock.on).toHaveBeenCalledWith('update', expect.any(Function))
  expect(clientMock.on).toHaveBeenCalledWith('ready', expect.any(Function))
});

test('should NOT subscribe to ready or update if client does NOT exist', () => {
  clientMock.on.mockClear()
  getVariantMock.mockReturnValueOnce(false);
  useContextSpy.mockReturnValue({ client: undefined, getVariant: getVariantMock });
  clientMock.on.mockImplementation((eventName: string, cb: Function) => {
    if (eventName === 'update') {
      cb()
    }
  });

  const { result } = renderHook(() => useVariant(givenFlagName));

  expect(result.current).toStrictEqual({});
  expect(clientMock.on).not.toHaveBeenCalled()
  expect(clientMock.on).not.toHaveBeenCalled()
  expect(getVariantMock).toHaveBeenCalledTimes(1);
});

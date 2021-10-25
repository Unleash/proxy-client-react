import { renderHook, act } from '@testing-library/react-hooks/native';
import React, { FC } from 'react';
import useFlag from './useFlag';
import FlagProvider from './FlagProvider';
// @ts-ignore
// ignore typings for the pure unleash-proxy-client library
import { UnleashClient } from 'unleash-proxy-client';

jest.mock('unleash-proxy-client');

interface WrapperProps {
  children?: FC
};

let flagName: string = 'Test';
let saveMockFn = jest.fn();
let getMockFn = jest.fn();

describe('Given the useFlag hook', () => {
  let wrapper: FC<WrapperProps>;

  beforeEach(() => {
    wrapper = ({ children }) => (
      <FlagProvider config={{
        appName: 'my-app',
        clientKey: 'my-secret',
        storage: {
          save: saveMockFn,
          get: getMockFn,
        },
        url: 'https://my-unleash-proxy'
      }}>{children}</FlagProvider>
    );
  });

  describe('and the flag is not enabled', () => {
    const { result, rerender } = renderHook(() => useFlag(flagName), {
      wrapper,
      initialProps: {}
    });

    act(() => {
      console.log(result.current);
    })
  
    expect(result.current).toBe(false);
  });
})
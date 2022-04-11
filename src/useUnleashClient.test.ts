/** @format */

import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import useUnleashClient from './useUnleashClient';

const useContextSpy = jest.spyOn(React, 'useContext');
const clientMock = jest.fn();
clientMock.mockReturnValue({});

test('should return the client when calling useUnleashClient', () => {
  useContextSpy.mockReturnValue({ client: clientMock });
  const { result } = renderHook(() => useUnleashClient());

  expect(result.current).toBe(clientMock);
});

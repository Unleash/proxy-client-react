import React from 'react';
import { renderHook } from '@testing-library/react-hooks/native';
import useFlags from './useFlags';
import type { IToggle } from 'unleash-proxy-client';
import { act } from 'react-dom/test-utils';

const toggles = [
  {
    name: 'string',
    enabled: true,
    variant: {
      name: 'string',
      enabled: false,
    },
    impressionData: false,
  },
  {
    name: 'string',
    enabled: true,
    variant: {
      name: 'string',
      enabled: false,
    },
    impressionData: false,
  },
];
test('should return flags', () => {
  jest.spyOn(React, 'useContext').mockImplementation(() => ({
    client: {
      getAllToggles: () => toggles,
      on: jest.fn(),
    },
  }));

  const { result } = renderHook(() => useFlags());
  expect(result.current).toEqual(toggles);
});

test('should update flags on update event', async () => {
  const updatedToggles: IToggle[] = [];
  const client = {
    getAllToggles: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
  };
  client.getAllToggles.mockReturnValue(toggles);

  jest.spyOn(React, 'useContext').mockImplementation(() => ({
    client,
  }));

  const { result } = renderHook(() => useFlags());
  expect(result.current).toEqual(toggles);
  client.getAllToggles.mockReturnValue(updatedToggles);
  await act(async () => {
    client.on.mock.calls[0][1]();
  });
  expect(result.current).toEqual(updatedToggles);
});

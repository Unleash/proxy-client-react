import { renderHook } from '@testing-library/react-hooks/native';
import React from 'react';
import useUnleashContext from './useUnleashContext';

const useContextSpy = jest.spyOn(React, 'useContext');
const updateContextMock = jest.fn().mockName('updateContext');

test('should return the updateContext function from context', () => {
  useContextSpy.mockReturnValue({ updateContext : updateContextMock});
  const { result } = renderHook(() => useUnleashContext());

  expect(result.current).toBe(updateContextMock);
});
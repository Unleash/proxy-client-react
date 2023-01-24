/**
 * @format
 * @jest-environment jsdom
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { EVENTS, UnleashClient } from 'unleash-proxy-client';
import '@testing-library/jest-dom';

import FlagProvider from './FlagProvider';
import useFlagsStatus from './useFlagsStatus';
import { act } from 'react-dom/test-utils';
import useFlag from './useFlag';
import useVariant from './useVariant';

test('should render toggles', async () => {
  const fetchMock = jest.fn(() => {
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({}),
      json: () => {
        return Promise.resolve({
          toggles: [
            {
              name: 'test-flag',
              enabled: true,
              variant: {
                name: 'A',
                payload: { type: 'string', value: 'A' },
                enabled: true,
              },
            },
          ],
        });
      },
    });
  });

  const client = new UnleashClient({
    url: 'http://localhost:4242/api/frontend',
    appName: 'test',
    clientKey: 'test',
    fetch: fetchMock,
  });

  const TestComponent = () => {
    const { flagsReady } = useFlagsStatus();
    const state = useFlag('test-flag');
    const variant = useVariant('test-flag');

    return (
      <>
        <div data-testid="ready">{flagsReady.toString()}</div>
        <div data-testid="state">{state.toString()}</div>
        <div data-testid="variant">{JSON.stringify(variant)}</div>
      </>
    );
  };

  const ui = (
    <FlagProvider unleashClient={client}>
      <TestComponent />
    </FlagProvider>
  );

  const { rerender } = render(ui);

  // Before client initialization
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByTestId('ready')).toHaveTextContent('false');
  expect(screen.getByTestId('state')).toHaveTextContent('false');
  expect(screen.getByTestId('variant')).toHaveTextContent('false');

  // Wait for client initialization
  await act(
    () =>
      new Promise((resolve) => {
        client.on(EVENTS.READY, resolve);
      })
  );

  // After client initialization
  expect(fetchMock).toHaveBeenCalled();
  rerender(ui);
  expect(screen.getByTestId('ready')).toHaveTextContent('true');
  expect(screen.getByTestId('state')).toHaveTextContent('true');
  expect(screen.getByTestId('variant')).toHaveTextContent(
    '{"name":"A","payload":{"type":"string","value":"A"},"enabled":true}'
  );
});

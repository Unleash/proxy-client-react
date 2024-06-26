import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import useFlagsStatus from './useFlagsStatus';
import FlagProvider from './FlagProvider';
import { EVENTS, UnleashClient } from 'unleash-proxy-client';

const TestComponent = () => {
  const { flagsReady } = useFlagsStatus();

  return <div>{flagsReady ? 'flagsReady' : 'loading'}</div>;
};

const mockClient = {
  on: vi.fn(),
  off: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  updateContext: vi.fn(),
  isEnabled: vi.fn(),
  getVariant: vi.fn(),
  isReady: vi.fn(),
} as unknown as UnleashClient;

test('should initialize', async () => {
  const onEventHandler = (event: string, callback: () => void) => {
    if (event === 'ready') {
      callback();
    }
  };

  mockClient.on = onEventHandler as typeof mockClient.on;

  const ui = (
    <FlagProvider unleashClient={mockClient}>
      <TestComponent />
    </FlagProvider>
  );

  render(ui);

  await waitFor(() => {
    expect(screen.queryByText('flagsReady')).toBeInTheDocument();
  });
});

// https://github.com/Unleash/proxy-client-react/issues/168
test('should start when already initialized client is passed', async () => {
  const client = new UnleashClient({
    url: 'http://localhost:4242/api',
    fetch: async () =>
      new Promise((resolve) => {
        setTimeout(() =>
          resolve({
            status: 200,
            ok: true,
            json: async () => ({
              toggles: [],
            }),
            headers: new Headers(),
          })
        );
      }),
    clientKey: '123',
    appName: 'test',
  });
  await client.start();
  expect(client.isReady()).toBe(true);

  const ui = (
    <FlagProvider unleashClient={client}>
      <TestComponent />
    </FlagProvider>
  );

  render(ui);

  await waitFor(() => {
    expect(screen.queryByText('flagsReady')).toBeInTheDocument();
  });
});

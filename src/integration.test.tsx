import React, { type FC } from 'react';
import { act, getByTestId, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom'
import { EVENTS, UnleashClient } from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import useFlagsStatus from './useFlagsStatus';
import useFlag from './useFlag';
import { useFlagContext } from './useFlagContext';
import useVariant from './useVariant';
import useUnleashContext from './useUnleashContext';
import userEvent from '@testing-library/user-event'

const fetchMock = vi.fn(async () => {
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

beforeEach(() => {
  vi.clearAllMocks();
});

test('should render toggles', async () => {
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
        client.on(EVENTS.READY, () => {
          setTimeout(resolve, 1);
        });
      })
  );

  // After client initialization
  expect(screen.getByTestId('ready')).toHaveTextContent('true');
  expect(screen.getByTestId('state')).toHaveTextContent('true');
  expect(screen.getByTestId('variant')).toHaveTextContent(
    '{"name":"A","payload":{"type":"string","value":"A"},"enabled":true,"feature_enabled":true}'
  );
  expect(fetchMock).toHaveBeenCalledOnce();
});

test('should be ready from the start if bootstrapped', () => {
  const Component: FC = () => {
    const { flagsReady } = useFlagsStatus();

    return <>{flagsReady ? 'ready' : ''}</>;
  }

  render(
    <FlagProvider
      config={{
        url: 'http://localhost:4242/api/frontend',
        appName: 'test',
        clientKey: 'test',
        bootstrap: [
          {
            name: 'test',
            enabled: true,
            variant: {
              name: 'A',
              enabled: true,
              payload: { type: 'string', value: 'A' },
            },
            impressionData: false,
          },
        ],
        fetch: fetchMock,
      }}
      startClient={false}
    >
      <Component />
    </FlagProvider>
  );

  expect(screen.getByText('ready')).toBeInTheDocument();
});

test('should immediately return value if boostrapped', () => {
  const Component = () => {
    const enabled = useFlag('test-flag');

    return <>{enabled ? 'enabled' : ''}</>;
  };

  render(
    <FlagProvider
      config={{
        url: 'http://localhost:4242/api/frontend',
        appName: 'test',
        clientKey: 'test',
        bootstrap: [
          {
            name: 'test-flag',
            enabled: true,
            variant: {
              name: 'A',
              enabled: true,
              payload: { type: 'string', value: 'A' },
            },
            impressionData: false,
          },
        ],
        fetch: fetchMock,
      }}
      startClient={false}
    >
      <Component />
    </FlagProvider>
  );

  expect(screen.queryByText('enabled')).toBeInTheDocument();
});

test('should render limited times when bootstrapped', async () => {
  let renders = 0;
  const config = {
    url: 'http://localhost:4242/api/frontend',
    appName: 'test',
    clientKey: 'test',
    bootstrap: [
      {
        name: 'test-flag',
        enabled: true,
        variant: {
          name: 'A',
          enabled: true,
          payload: { type: 'string', value: 'A' },
        },
        impressionData: false,
      },
    ],
    fetch: fetchMock,
  };
  const client = new UnleashClient(config);

  const Component = () => {
    const enabled = useFlag('test-flag');
    const { flagsReady } = useFlagsStatus();

    renders += 1;

    return (
      <>
        <span>{flagsReady ? 'flagsReady' : ''}</span>
        <span>{enabled ? 'enabled' : ''}</span>
      </>
    );
  };

  render(
    <FlagProvider unleashClient={client} config={config}>
      <Component />
    </FlagProvider>
  );

  expect(screen.queryByText('enabled')).toBeInTheDocument();
  expect(screen.queryByText('flagsReady')).toBeInTheDocument();
  expect(renders).toBe(1);

  // Wait for client initialization
  await act(
    () =>
      new Promise((resolve) => {
        client.on(EVENTS.READY, () => {
          setTimeout(resolve, 1);
        });
      })
  );

  expect(renders).toBe(1);
});

test('should resolve values before setting flagsReady', async () => {
  const client = new UnleashClient({
    url: 'http://localhost:4242/api/frontend',
    appName: 'test',
    clientKey: 'test',
    fetch: fetchMock,
  });
  let renders = 0;

  const Component = () => {
    const enabled = useFlag('test-flag');
    const { flagsReady } = useFlagsStatus();

    renders += 1;

    return (
      <>
        <span>{flagsReady ? 'flagsReady' : ''}</span>
        <span>{enabled ? 'enabled' : ''}</span>
      </>
    );
  };

  const ui = (
    <FlagProvider unleashClient={client}>
      <Component />
    </FlagProvider>
  );

  render(ui);
  expect(renders).toBe(1);
  expect(screen.queryByText('flagsReady')).not.toBeInTheDocument();
  expect(screen.queryByText('enabled')).not.toBeInTheDocument();
  await waitFor(() => {
    expect(screen.queryByText('enabled')).toBeInTheDocument();
    expect(screen.queryByText('flagsReady')).toBeNull();
    expect(renders).toBe(2);
  });
  await waitFor(() => {
    expect(screen.queryByText('flagsReady')).toBeInTheDocument();
    expect(screen.queryByText('enabled')).toBeInTheDocument();
    expect(renders).toBe(3);
  });
});

test('should only re-render if flag changed, and not on status or context change', async () => {
  const client = new UnleashClient({
    url: 'http://localhost:4242/api/frontend',
    appName: 'test',
    clientKey: 'test',
    fetch: fetchMock,
  });
  let renders = 0;
  let sessionId = 0;

  const FlagTestComponent: FC = () => {
    const flag = useFlag('another-flag');
    renders += 1;

    return (
        <div data-testid="flag">{flag.toString()}</div>
    );
  };

  const FlagContextComponent: FC = () => {
    const updateContext = useUnleashContext();

    return (
      <button type='button' onClick={() => updateContext({
        sessionId: `${sessionId++}`,
      })}>
        update context
      </button>
    );
  };

  const ui = (
    <FlagProvider unleashClient={client}>
      <FlagTestComponent />
      <FlagContextComponent />
    </FlagProvider>
  );

  const { debug } = render(ui);

  // Before client initialization
  expect(fetchMock).not.toHaveBeenCalled();
  expect(screen.getByTestId('flag')).toHaveTextContent('false');
  expect(renders).toBe(1);

  // Wait for client initialization
  await act(
    () =>
      new Promise((resolve) => {
        client.on(EVENTS.READY, () => {
          setTimeout(resolve, 1);
        });
      })
  );

  expect(screen.getByTestId('flag')).toHaveTextContent('false');

  fetchMock.mockImplementationOnce(async () => {
    return Promise.resolve({
      ok: true,
      status: 200,
      headers: new Headers({}),
      json: () => {
        return Promise.resolve({
          toggles: [
            {
              name: 'another-flag',
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

  // Simulate flag updates
  await act(() => client.updateToggles());
  expect(screen.getByTestId('flag')).toHaveTextContent('true');
  await userEvent.click(screen.getByRole('button', { name: 'update context' }));
  await act(() => client.updateToggles());
  expect(screen.getByTestId('flag')).toHaveTextContent('false');
  await act(() => client.updateToggles());
  expect(screen.getByTestId('flag')).toHaveTextContent('false');

  expect(fetchMock).toHaveBeenCalledTimes(5);
  expect(renders).toBe(3);
});

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import useFlagsStatus from "./useFlagsStatus";
import FlagProvider from './FlagProvider';
import { EVENTS, type UnleashClient } from 'unleash-proxy-client';

const TestComponent = () => {
    const { flagsReady } = useFlagsStatus();

    return <div>{flagsReady ? 'flagsReady' : 'loading'}</div>;
}

const mockClient = {
    on: vi.fn(),
    off: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    updateContext: vi.fn(),
    isEnabled: vi.fn(),
    getVariant: vi.fn(),
} as unknown as UnleashClient;

test('should initialize', async () => {
    const onEventHandler = (event: string, callback: () => void) => {
        if (event === 'ready') {
            callback();
        }
    }

    mockClient.on = onEventHandler as typeof mockClient.on;

    const ui = (
        <FlagProvider unleashClient={mockClient}>
            <TestComponent />
        </FlagProvider>
    )

    render(ui);

    await waitFor(() => {
        expect(screen.queryByText('flagsReady')).toBeInTheDocument();
    });
});

// https://github.com/Unleash/proxy-client-react/issues/168
test('should start when already initialized client is passed', async () => {
    let initialized = false;
    const onEventHandler = (event: string, callback: () => void) => {
        if (event === EVENTS.READY && !initialized) {
            initialized = true;
            callback();
        }
    }

    mockClient.on = onEventHandler as typeof mockClient.on;

    await new Promise((resolve) => mockClient.on(EVENTS.READY, () => resolve));

    const ui = (
        <FlagProvider unleashClient={mockClient}>
            <TestComponent />
        </FlagProvider>
    )

    render(ui);

    await waitFor(() => {
        expect(screen.queryByText('flagsReady')).toBeInTheDocument();
    });
});

/**
 * @format
 * @jest-environment jsdom
 */

import React, { useContext, useEffect, useState } from 'react';
import { render, screen, RenderOptions } from '@testing-library/react';
import * as UnleashClientModule from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import FlagContext from './FlagContext';

import '@testing-library/jest-dom';
import { EVENTS } from 'unleash-proxy-client';
interface IFlagProvider {
  config: UnleashClientModule.IConfig;
}
interface renderConsumerOptions {
  providerProps: IFlagProvider;
  renderOptions: RenderOptions;
}

const getVariantMock = jest.fn().mockReturnValue('A');
const updateContextMock = jest.fn();
const startClientMock = jest.fn();
const stopClientMock = jest.fn();
const onMock = jest.fn().mockReturnValue('subscribed');
const offMock = jest.fn();
const isEnabledMock = jest.fn().mockReturnValue(true);
const UnleashClientSpy: jest.SpyInstance = jest.spyOn(
  UnleashClientModule,
  'UnleashClient'
);

const givenConfig = {
  appName: 'my-app',
  clientKey: 'my-secret',
  url: 'https://my-unleash-proxy',
};
const givenFlagName = 'test';
const givenContext = { session: 'context' };

beforeEach(() => {
  onMock.mockClear();
});

UnleashClientSpy.mockReturnValue({
  getVariant: getVariantMock,
  updateContext: updateContextMock,
  start: startClientMock,
  stop: stopClientMock,
  isEnabled: isEnabledMock,
  on: onMock,
  off: offMock,
});

const noop = () => {};

const FlagConsumerAfterClientInit = () => {
  const { updateContext, isEnabled, getVariant, client, on } =
    useContext(FlagContext);
  const [enabled, setIsEnabled] = useState(false);
  const [variant, setVariant] = useState<UnleashClientModule.IVariant>();
  const [context, setContext] = useState<any>('nothing');
  const [currentOn, setCurrentOn] =
    useState<UnleashClientModule.UnleashClient>();

  useEffect(() => {
    if (client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName));
      setContext(updateContext(givenContext as any));
      setCurrentOn(on('someEvent', noop, 'someArgument'));
    }
  }, [client]);

  return (
    <>
      <div>{`consuming value isEnabled ${enabled}`}</div>
      <div>{`consuming value updateContext ${context}`}</div>
      <div>{`consuming value getVariant ${variant}`}</div>
      <div>{`consuming value on ${currentOn}`}</div>
    </>
  );
};

const FlagConsumerBeforeClientInit = () => {
  const { updateContext, isEnabled, getVariant, client, on } =
    useContext(FlagContext);
  const [enabled, setIsEnabled] = useState(false);
  const [variant, setVariant] = useState<UnleashClientModule.IVariant>();
  const [context, setContext] = useState<any>('nothing');
  const [currentOn, setCurrentOn] =
    useState<UnleashClientModule.UnleashClient>();

  useEffect(() => {
    if (!client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName));
      setContext(updateContext(givenContext as any));
      setCurrentOn(on('someEvent', noop, 'someArgument'));
    }
  }, []);

  return <></>;
};

const renderConsumer = (
  ui: any,
  { providerProps, renderOptions }: renderConsumerOptions
) => {
  return render(
    <FlagProvider config={providerProps.config}>{ui}</FlagProvider>,
    renderOptions
  );
};

const renderConsumerWithUnleashClient = (
  ui: any,
  { providerProps, renderOptions }: renderConsumerOptions
) => {
  const client = new UnleashClientModule.UnleashClient(providerProps.config);
  return render(
    <FlagProvider unleashClient={client}>{ui}</FlagProvider>,
    renderOptions
  );
};

test('A consumer that subscribes AFTER client init shows values from provider and calls all the functions', () => {
  const providerProps = {
    config: givenConfig,
  };

  renderConsumer(<FlagConsumerAfterClientInit />, {
    providerProps,
    renderOptions: {},
  });

  expect(getVariantMock).toHaveBeenCalledWith(givenFlagName);
  expect(isEnabledMock).toHaveBeenCalledWith(givenFlagName);
  expect(updateContextMock).toHaveBeenCalledWith(givenContext);
  expect(screen.getByText(/consuming value isEnabled/)).toHaveTextContent(
    'consuming value isEnabled true'
  );
  expect(screen.getByText(/consuming value updateContext/)).toHaveTextContent(
    'consuming value updateContext [object Promise]'
  );
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent(
    'consuming value getVariant A'
  );
  expect(screen.getByText(/consuming value on/)).toHaveTextContent(
    'consuming value on subscribed'
  );
});

test('A consumer that subscribes BEFORE client init shows values from provider and calls all the functions', () => {
  const providerProps = {
    config: givenConfig,
  };

  renderConsumer(<FlagConsumerBeforeClientInit />, {
    providerProps,
    renderOptions: {},
  });

  expect(getVariantMock).toHaveBeenCalledWith(givenFlagName);
  expect(isEnabledMock).toHaveBeenCalledWith(givenFlagName);
  expect(updateContextMock).toHaveBeenCalledWith(givenContext);
});

test('A consumer should be able to get a variant when the client is passed into the provider as props', () => {
  const providerProps = {
    config: givenConfig,
  };

  renderConsumerWithUnleashClient(<FlagConsumerAfterClientInit />, {
    providerProps,
    renderOptions: {},
  });

  expect(getVariantMock).toHaveBeenCalledWith(givenFlagName);
  expect(isEnabledMock).toHaveBeenCalledWith(givenFlagName);
  expect(updateContextMock).toHaveBeenCalledWith(givenContext);
  expect(screen.getByText(/consuming value isEnabled/)).toHaveTextContent(
    'consuming value isEnabled true'
  );
  expect(screen.getByText(/consuming value updateContext/)).toHaveTextContent(
    'consuming value updateContext [object Promise]'
  );
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent(
    'consuming value getVariant A'
  );
  expect(screen.getByText(/consuming value on/)).toHaveTextContent(
    'consuming value on subscribed'
  );
});

test('A memoized consumer should not rerender when the context provider values are the same', () => {
  const renderCounter = jest.fn();

  const MemoizedConsumer = React.memo(() => {
    const { updateContext, isEnabled, getVariant, client, on } =
      useContext(FlagContext);

    renderCounter();

    return <></>;
  });

  expect(renderCounter).toHaveBeenCalledTimes(0);

  const { rerender } = render(
    <FlagProvider config={givenConfig}>
      <MemoizedConsumer />
    </FlagProvider>
  );

  expect(renderCounter).toHaveBeenCalledTimes(1);

  rerender(
    <FlagProvider config={givenConfig}>
      <MemoizedConsumer />
    </FlagProvider>
  );

  expect(renderCounter).toHaveBeenCalledTimes(1);
});

test('should update when ready event is sent', () => {
  const localMock = jest.fn();
  UnleashClientSpy.mockReturnValue({
    getVariant: getVariantMock,
    updateContext: updateContextMock,
    start: startClientMock,
    stop: stopClientMock,
    isEnabled: isEnabledMock,
    on: localMock,
    off: offMock,
  });

  const providerProps = {
    config: givenConfig,
  };

  const client = new UnleashClientModule.UnleashClient(providerProps.config);

  render(
    <FlagProvider unleashClient={client}>
      <div>Hi</div>
    </FlagProvider>
  );

  localMock.mockImplementation((event, cb) => {
    if (event === EVENTS.READY) {
      cb();
    }
  });

  expect(localMock).toHaveBeenCalledWith(EVENTS.READY, expect.any(Function));
});

test('should register error when error event is sent', () => {
  const localMock = jest.fn();
  UnleashClientSpy.mockReturnValue({
    getVariant: getVariantMock,
    updateContext: updateContextMock,
    start: startClientMock,
    stop: stopClientMock,
    isEnabled: isEnabledMock,
    on: localMock,
    off: offMock,
  });

  const providerProps = {
    config: givenConfig,
  };

  const client = new UnleashClientModule.UnleashClient(providerProps.config);

  render(
    <FlagProvider unleashClient={client}>
      <div>Hi</div>
    </FlagProvider>
  );

  localMock.mockImplementation((event, cb) => {
    if (event === EVENTS.ERROR) {
      cb('Error');
    }
  });

  expect(localMock).toHaveBeenCalledWith(EVENTS.ERROR, expect.any(Function));
});

test('should not start client if startClient is false', () => {
  const localMock = jest.fn();
  const stopMock = jest.fn();
  UnleashClientSpy.mockReturnValue({
    getVariant: getVariantMock,
    updateContext: updateContextMock,
    start: localMock,
    stop: stopMock,
    isEnabled: isEnabledMock,
    on: onMock,
    off: offMock,
  });

  const providerProps = {
    config: givenConfig,
  };

  const client = new UnleashClientModule.UnleashClient(providerProps.config);

  render(
    <FlagProvider unleashClient={client} startClient={false}>
      <div>Hi</div>
    </FlagProvider>
  );

  expect(localMock).not.toHaveBeenCalled();
  expect(stopMock).not.toHaveBeenCalled();
});

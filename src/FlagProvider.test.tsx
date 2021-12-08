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
const onMock = jest.fn().mockReturnValue('subscribed');
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

UnleashClientSpy.mockReturnValue({
  getVariant: getVariantMock,
  updateContext: updateContextMock,
  start: startClientMock,
  isEnabled: isEnabledMock,
  on: onMock,
});

const FlagConsumerAfterClientInit = () => {
  const { updateContext, isEnabled, getVariant, client, on } =
    useContext(FlagContext);
  const [enabled, setIsEnabled] = useState('nothing');
  const [variant, setVariant] = useState('nothing');
  const [context, setContext] = useState('nothing');
  const [currentOn, setCurrentOn] = useState('nothing');

  useEffect(() => {
    if (client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName));
      setContext(updateContext(givenContext));
      setCurrentOn(on('someEvent', 'someArgument'));
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
  const [enabled, setIsEnabled] = useState('nothing');
  const [variant, setVariant] = useState('nothing');
  const [context, setContext] = useState('nothing');
  const [currentOn, setCurrentOn] = useState('nothing');

  useEffect(() => {
    if (!client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName));
      setContext(updateContext(givenContext));
      setCurrentOn(on('someEvent', 'someArgument'));
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
  const client = new UnleashClientModule.UnleashClient(
    providerProps.config
  );
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
  expect(
    screen.getByText(/consuming value updateContext/)
  ).toHaveTextContent('consuming value updateContext [object Promise]');
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
  expect(
    screen.getByText(/consuming value updateContext/)
  ).toHaveTextContent('consuming value updateContext [object Promise]');
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent(
    'consuming value getVariant A'
  );
  expect(screen.getByText(/consuming value on/)).toHaveTextContent(
    'consuming value on subscribed'
  );
});

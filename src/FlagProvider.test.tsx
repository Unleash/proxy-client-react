/**
 * @jest-environment jsdom
 */
import React, { useContext, useEffect, useState } from 'react';
import { render, screen , RenderOptions} from '@testing-library/react';
import * as UnleashClientModule from 'unleash-proxy-client';
import FlagProvider from './FlagProvider';
import FlagContext from './FlagContext';

import '@testing-library/jest-dom'
interface IFlagProvider {
  config: UnleashClientModule.IConfig;
}
interface renderConsumerOptions {
  providerProps: IFlagProvider,
  renderOptions: RenderOptions,
  client?: UnleashClientModule.UnleashClient
}

const getVariantMock = jest.fn().mockReturnValue('A');
const updateContextMock = jest.fn();
const startClientMock = jest.fn();
const onMock = jest.fn().mockReturnValue('subscribed');
const isEnabledMock = jest.fn().mockReturnValue(true)
const UnleashClientSpy:jest.SpyInstance = jest.spyOn(UnleashClientModule, 'UnleashClient');
const givenConfig = {
  appName: 'my-app',
  clientKey: 'my-secret',
  url: 'https://my-unleash-proxy'
}
const givenFlagName = 'test';
const givenContext = { session: 'context' };
const givenToggles = [{
  'name':'bootstrap-test',
  'enabled': true,
  'variant': {
    'name': 'on',
    'enabled': true
  }
}]

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(),
  })
);

const mockUnleashClient = () =>
  UnleashClientSpy.mockReturnValue({
    getVariant: getVariantMock,
    updateContext: updateContextMock,
    start: startClientMock,
    isEnabled: isEnabledMock,
    on: onMock
  });

const restoreUnleashClient = () => 
  UnleashClientSpy.mockRestore();

const FlagConsumerAfterClientInit = () => {
  const { updateContext, isEnabled, getVariant, client, on } = useContext(FlagContext);
  const [enabled, setIsEnabled] = useState('nothing');
  const [variant, setVariant] = useState('nothing');
  const [context, setContext] = useState('nothing');
  const [currentOn, setCurrentOn] = useState('nothing');

  useEffect(() => {
    if (client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName))
      setContext(updateContext(givenContext));
      setCurrentOn(on('someEvent', 'someArgument'));
    }
  }, [client])
  
  return (
    <>
      <div>{`consuming value isEnabled ${enabled}`}</div>
      <div>{`consuming value updateContext ${context}`}</div>
      <div>{`consuming value getVariant ${variant}`}</div>
      <div>{`consuming value on ${currentOn}`}</div>
    </>
  )
}

const FlagConsumerBeforeClientInit = () => {
  const { updateContext, isEnabled, getVariant, client, on} = useContext(FlagContext);
  const [enabled, setIsEnabled] = useState('nothing');
  const [variant, setVariant] = useState('nothing');
  const [context, setContext] = useState('nothing');
  const [currentOn, setCurrentOn] = useState('nothing');

  useEffect(() => {
    if (!client) {
      setIsEnabled(isEnabled(givenFlagName));
      setVariant(getVariant(givenFlagName))
      setContext(updateContext(givenContext));
      setCurrentOn(on('someEvent', 'someArgument'));
    }
  }, [])
  
  return <></>
}

const FlagConsumerWithBootstrappedToggles = () => {
  const { isEnabled, getVariant } = useContext(FlagContext);
  const enabled = isEnabled(givenToggles[0].name);
  const variant = getVariant(givenToggles[0].name);
  
  return (
    <>
      <div>{`consuming value isEnabled ${enabled}`}</div>
      <div>{`consuming value getVariant ${variant.name}`}</div>
    </>
  )
}

const renderConsumer = (ui: any, { providerProps, renderOptions, client } : renderConsumerOptions) => {
  return render(
    <FlagProvider config={providerProps.config} client={client}>{ui}</FlagProvider>,
    renderOptions,
  )
}

test('A consumer that subscribes AFTER client init shows values from provider and calls all the functions', () => {
  mockUnleashClient();

  const providerProps = {
    config: givenConfig
  }
  
  renderConsumer(<FlagConsumerAfterClientInit />, { providerProps, renderOptions: {} })
  
  expect(getVariantMock).toHaveBeenCalledWith(givenFlagName);
  expect(isEnabledMock).toHaveBeenCalledWith(givenFlagName);
  expect(updateContextMock).toHaveBeenCalledWith(givenContext);
  expect(screen.getByText(/consuming value isEnabled/)).toHaveTextContent('consuming value isEnabled true')
  expect(screen.getByText(/consuming value updateContext/)).toHaveTextContent('consuming value updateContext [object Promise]')
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent('consuming value getVariant A')
  expect(screen.getByText(/consuming value on/)).toHaveTextContent('consuming value on subscribed')

  restoreUnleashClient();
});

test('A consumer that subscribes BEFORE client init shows values from provider and calls all the functions', () => {
  mockUnleashClient();

  const providerProps = {
    config: givenConfig
  }

  renderConsumer(<FlagConsumerBeforeClientInit />, {providerProps, renderOptions:{}})
  
  expect(getVariantMock).toHaveBeenCalledWith(givenFlagName);
  expect(isEnabledMock).toHaveBeenCalledWith(givenFlagName);
  expect(updateContextMock).toHaveBeenCalledWith(givenContext);

  restoreUnleashClient();
});

test('A provider can be synchronously bootstraped with toggles', () => {
  UnleashClientSpy.mockReturnValue({
    start: startClientMock,
  });
    
  const providerProps = {
    config: {
      ...givenConfig,
      bootstrap: givenToggles
    },
    
  }
    
  renderConsumer(<FlagConsumerWithBootstrappedToggles />, { providerProps, renderOptions: {} })
  
  expect(screen.getByText(/consuming value isEnabled/)).toHaveTextContent('consuming value isEnabled true')
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent('consuming value getVariant on')
    
  restoreUnleashClient();
});

test('A provider can use external Unleash client', () => {
  UnleashClientSpy.mockReturnValue({
    start: startClientMock,
    fetchToggles: jest.fn(),
  });

  const unleashClientConfig = {
    ...givenConfig,
    storageProvider: new UnleashClientModule.InMemoryStorageProvider,
    bootstrap: givenToggles
  }

  const customUnleashClient = new UnleashClientModule.UnleashClient(unleashClientConfig)
    
  const providerProps = {
    config: unleashClientConfig,
    client: customUnleashClient
  }
    
  renderConsumer(<FlagConsumerWithBootstrappedToggles />, { providerProps, renderOptions: {} })
  
  expect(screen.getByText(/consuming value isEnabled/)).toHaveTextContent('consuming value isEnabled true')
  expect(screen.getByText(/consuming value getVariant/)).toHaveTextContent('consuming value getVariant on')
    
  restoreUnleashClient();
})
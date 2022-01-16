# DISCLAIMER:

This library is meant to be used with the [unleash-proxy](https://github.com/Unleash/unleash-proxy). The proxy application layer will sit between your unleash instance and your client applications, and provides performance and security benefits. DO NOT TRY to connect this library directly to the unleash instance, as the datasets follow different formats because the proxy only returns evaluated toggle information.

# Installation

```bash
npm install @unleash/proxy-client-react
// or
yarn add @unleash/proxy-client-react
```

Import the provider like this in your entrypoint file (typically index.js/ts):

```jsx
import FlagProvider from '@unleash/proxy-client-react';

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev',
};

ReactDOM.render(
  <React.StrictMode>
    <FlagProvider config={config}>
      <App />
    </FlagProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

Alternatively, you can pass your own client in to the FlagProvider:

```jsx
import FlagProvider, { UnleashClient } from '@unleash/proxy-client-react';

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev',
};

const client = new UnleashClient(config);

ReactDOM.render(
  <React.StrictMode>
    <FlagProvider unleashClient={client}>
      <App />
    </FlagProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

To check if a feature is enabled:

```jsx
import { useFlag } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const enabled = useFlag('travel.landing');

  if (enabled) {
    return <SomeComponent />
  }
  return <AnotherComponent />
};

export default TestComponent;
```

To check variants:

```jsx
import { useVariant } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const variant = useVariant('travel.landing');

  if (variant.enabled && variant.name === "SomeComponent") {
    return <SomeComponent />
  } else if (variant.enabled && variant.name === "AnotherComponent") {
    return <AnotherComponent />
  }
  return <DefaultComponent />
};

export default TestComponent;
```

## Defer rendering until flags fetched

useFlagsStatus retrieves the ready state and error events.
Follow the following steps in order to delay rendering until the flags have been fetched.

```jsx
import { useFlagsStatus } from '@unleash/proxy-client-react'

const MyApp = () => {
  const { flagsReady, flagsError } = useFlagsStatus();

  if (!flagsReady) {
    return <Loading />
  }
  return <MyComponent error={flagsError}/>
}

```

## Updating context

Follow the following steps in order to update the unleash context:

```jsx
import { useUnleashContext, useFlag } from '@unleash/proxy-client-react'

const MyComponent = ({ userId }) => {
  const variant = useFlag("my-toggle");
  const updateContext = useUnleashContext();

  useEffect(() => {
    // context is updated with userId
    updateContext({ userId })
  }, [userId])

  useEffect(() => {
    async function run() {
    // Can wait for the new flags to pull in from the different context
      await updateContext({ userId });
      console.log('new flags loaded for', userId);
    }
    run();
  }, [userId]);
}

```

## React Native

Because React Native doesn't run in a web browser, it doesn't have access to the `localStorage` API. Instead, you need to tell Unleash to use your specific storage provider. The most common storage provider for React Native is [AsyncStorage](https://github.com/react-native-async-storage/async-storage).
To configure it, add the following property to your configuration object:

```js
const config = {
  storageProvider: {
    save: (name, data) => AsyncStorage.setItem(name, JSON.stringify(data)),
    get: (name) => AsyncStorage.getItem(name),
  },
};
```

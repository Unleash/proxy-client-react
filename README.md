# DISCLAIMER:

This library is meant to be used with the [unleash-proxy](https://github.com/Unleash/unleash-proxy). The proxy application layer will sit between your unleash instance and your client applications, and provides performance and security benefits. DO NOT TRY to connect this library directly to the unleash instance, as the datasets follow different formats because the proxy only returns evaluated toggle information.

# Installation

```bash
npm install @unleash/proxy-client-react
// or
yarn add @unleash/proxy-client-react
```
# Upgrade path from v1 -> v2
If you were previously using the built in Async storage used in the unleash-proxy-client-js, this no longer comes bundled with the library. You will need to install the storage adapter for your preferred storage solution. Otherwise there are no breaking changes.

# Upgrade path from v2 -> v3
Previously the unleash client was bundled as dependency directly in this library. It's now changed to a peer dependency and listed as an external.

In v2 there was only one distribution based on the fact that webpack polyfilled the necessary features in v4. This is no longer the case in webpack v5. We now provide two distribution builds, one for the server and one for the client - and use the browser field in the npm package to hint module builders about which version to use. The default `dist/index.js` file points to the node version, while the web build is located at `dist/index.browser.js`

Upgrading should be as easy as running yarn again with the new version, but we made the made bump regardless to be safe.

# Initialization

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

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can delay the polling by:
- setting the `startClient` prop to `false`
- passing a client instance to the `FlagProvider`

```jsx
ReactDOM.render(
  <React.StrictMode>
    <FlagProvider unleashClient={client} startClient={false}>
      <App />
    </FlagProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
```

Deferring the client start gives you more fine-grained control over when to start fetching the feature toggle configuration. This could be handy in cases where you need to get some other context data from the server before fetching toggles, for instance.

To start the client, use the client's `start` method. The below snippet of pseudocode will defer polling until the end of the `asyncProcess` function.

``` jsx
const client = new UnleashClient({ /* ... */ })

useEffect(() => {
    const asyncProcess = async () => {
	// do async work ...
	client.start()
    }
    asyncProcess()
  }, [])

return (
  // Pass client as `unleashClient` and set `startClient` to `false`
  <FlagProvider unleashClient={client} startClient={false}>
    <App />
  </FlagProvider>
)
```

# Usage

## Check feature toggle status

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

## Check variants

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

## Use unleash client directly

```jsx
import { useUnleashContext, useUnleashClient } from '@unleash/proxy-client-react'

const MyComponent = ({ userId }) => {
  const client = useUnleashClient();

  const updateContext = useUnleashContext();

  const login = () => {
    // login user
    if (client.isEnabled("new-onboarding")) {
      // Send user to new onboarding flow
    } else (
      // send user to old onboarding flow
    )
  }

  return <LoginForm login={login}/>
}
```

## React Native

IMPORTANT: This no longer comes included in the unleash-proxy-client-js library. You will need to install the storage adapter for your preferred storage solution.

Because React Native doesn't run in a web browser, it doesn't have access to the `localStorage` API. Instead, you need to tell Unleash to use your specific storage provider. The most common storage provider for React Native is [AsyncStorage](https://github.com/react-native-async-storage/async-storage).
To configure it, add the following property to your configuration object:

```js
const config = {
  storageProvider: {
    save: (name, data) => AsyncStorage.setItem(name, JSON.stringify(data)),
    get: async (name) => {
      const data = await AsyncStorage.getItem(name);
      return data ? JSON.parse(data) : undefined;
    }
  },
};
```

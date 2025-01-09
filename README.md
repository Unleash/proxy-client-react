# Installation

```bash
npm install @unleash/proxy-client-react unleash-proxy-client
# or
yarn add @unleash/proxy-client-react unleash-proxy-client
```

# How to use

This library uses the core [unleash-proxy-client](https://github.com/Unleash/unleash-proxy-client-js) JS client as a base.

## Initialize the client

*NOTE*: [unleash-proxy](https://github.com/Unleash/unleash-proxy) is in maintenance moded. It is recommend to use the [Frontend API](https://docs.getunleash.io/reference/front-end-api) or [unleash-edge](https://github.com/Unleash/unleash-edge) instead

Prepare [Unleash Proxy](https://docs.getunleash.io/reference/unleash-proxy) secret
or [Frontend API Access](https://docs.getunleash.io/reference/front-end-api) token.

Import the provider like this in your entrypoint file (typically index.js/ts):

```jsx
import { createRoot } from 'react-dom/client';
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
  url: '<unleash-url>/api/frontend', // Your front-end API URL or the Unleash proxy's URL (https://<proxy-url>/proxy)
  clientKey: '<your-token>', // A client-side API token OR one of your proxy's designated client keys (previously known as proxy secrets)
  refreshInterval: 15, // How often (in seconds) the client should poll the proxy for updates
  appName: 'your-app-name', // The name of your application. It's only used for identifying your application
};

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FlagProvider config={config}>
      <App />
    </FlagProvider>
  </React.StrictMode>
);
```


### Connection options

To connect this SDK to your Unleash instance's [front-end API](https://docs.getunleash.io/reference/front-end-api), use the URL to your Unleash instance's front-end API (`<unleash-url>/api/frontend`) as the `url` parameter. For the `clientKey` parameter, use a `FRONTEND` token generated from your Unleash instance. Refer to the [_how to create API tokens_](https://docs.getunleash.io/how-to/how-to-create-api-tokens) guide for the necessary steps.

To connect this SDK to the [Unleash proxy](https://docs.getunleash.io/reference/unleash-proxy), use the proxy's URL and a [proxy client key](https://docs.getunleash.io/reference/api-tokens-and-client-keys#proxy-client-keys). The [_configuration_ section of the Unleash proxy docs](https://docs.getunleash.io/reference/unleash-proxy#configuration) contains more info on how to configure client keys for your proxy.

## Check feature toggle status

To check if a feature is enabled:

```jsx
import { useFlag } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const enabled = useFlag('travel.landing');

  if (enabled) {
    return <SomeComponent />;
  }
  return <AnotherComponent />;
};

export default TestComponent;
```

## Check variants

To check variants:

```jsx
import { useVariant } from '@unleash/proxy-client-react';

const TestComponent = () => {
  const variant = useVariant('travel.landing');

  if (variant.enabled && variant.name === 'SomeComponent') {
    return <SomeComponent />;
  } else if (variant.enabled && variant.name === 'AnotherComponent') {
    return <AnotherComponent />;
  }
  return <DefaultComponent />;
};

export default TestComponent;
```

## Defer rendering until flags fetched

useFlagsStatus retrieves the ready state and error events.
Follow the following steps in order to delay rendering until the flags have been fetched.

```jsx
import { useFlagsStatus } from '@unleash/proxy-client-react';

const MyApp = () => {
  const { flagsReady, flagsError } = useFlagsStatus();

  if (!flagsReady) {
    return <Loading />;
  }
  return <MyComponent error={flagsError} />;
};
```

## Updating context

Initial context can be specified on a `FlagProvider` `config.context` property.

`<FlagProvider config={{ ...config, context: { userId: 123 }}>`

This code sample shows you how to update the unleash context dynamically:

```jsx
import { useUnleashContext, useFlag } from '@unleash/proxy-client-react';

const MyComponent = ({ userId }) => {
  const variant = useFlag('my-toggle');
  const updateContext = useUnleashContext();

  useEffect(() => {
    // context is updated with userId
    updateContext({ userId });
  }, [userId]);

  // OR if you need to perform an action right after new context is applied
  useEffect(() => {
    async function run() {
      // Can wait for the new flags to pull in from the different context
      await updateContext({ userId });
      console.log('new flags loaded for', userId);
    }
    run();
  }, [userId]);
};
```

## Listening to events

The core Javascript client will emit different types on events based on what is happening in
the internals. You can listen on these events by leveraging the hook to return the client and listen
directly to these events. Or, if you are instantiating the FlagProvider with a client, use the client directly
to listen to events. [See the full list of events here.](https://github.com/Unleash/unleash-proxy-client-js?tab=readme-ov-file#available-events)

NOTE: `FlagProvider` is leveraging these internal events to provide information through `useFlagsStatus`.

```jsx
import { useUnleashContext, useFlag } from '@unleash/proxy-client-react';

const MyComponent = ({ userId }) => {
  const client = useUnleashClient();

  useEffect(() => {
    if (client) {
      const handleError = () => {
        // Handle error
      }

      client.on('error', handleError)
    }

    return () => {
      client.off('error', handleCallback)
    }
  }, [client])

  // ...rest of component
};
```

# Advanced use cases

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can prevent it by setting `startClient` prop to `false`. This is useful when you'd like to for example bootstrap the client and work offline.

Deferring the client start gives you more fine-grained control over when to start fetching the feature toggle configuration. This could be handy in cases where you need to get some other context data from the server before fetching toggles, for instance.

To start the client, use the client's `start` method. The below snippet of pseudocode will defer polling until the end of the `asyncProcess` function.

```jsx
const client = new UnleashClient({
  /* ... */
});

const MyAppComponent = () => {
  useEffect(() => {
    const asyncProcess = async () => {
      // do async work ...
      client.start();
    };
    asyncProcess();
  }, []);

  return (
    // Pass client as `unleashClient` and set `startClient` to `false`
    <FlagProvider unleashClient={client} startClient={false}>
      <App />
    </FlagProvider>
  );
};
```

## Use unleash client directly

```jsx
import { useUnleashContext, useUnleashClient } from '@unleash/proxy-client-react'

const MyComponent = ({ userId }) => {
  const client = useUnleashClient();

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

## Usage with class components

Since this library uses hooks you have to implement a wrapper to use with class components. Beneath you can find an example of how to use this library with class components, using a custom wrapper:

```jsx
import React from 'react';
import {
  useFlag,
  useUnleashClient,
  useUnleashContext,
  useVariant,
  useFlagsStatus,
} from '@unleash/proxy-client-react';

interface IUnleashClassFlagProvider {
  render: (props: any) => React.ReactNode;
  flagName: string;
}

export const UnleashClassFlagProvider = ({
  render,
  flagName,
}: IUnleashClassFlagProvider) => {
  const enabled = useFlag(flagName);
  const variant = useVariant(flagName);
  const client = useUnleashClient();

  const updateContext = useUnleashContext();
  const { flagsReady, flagsError } = useFlagsStatus();

  const isEnabled = () => {
    return enabled;
  };

  const getVariant = () => {
    return variant;
  };

  const getClient = () => {
    return client;
  };

  const getUnleashContextSetter = () => {
    return updateContext;
  };

  const getFlagsStatus = () => {
    return { flagsReady, flagsError };
  };

  return (
    <>
      {render({
        isEnabled,
        getVariant,
        getClient,
        getUnleashContextSetter,
        getFlagsStatus,
      })}
    </>
  );
};
```

Wrap your components like so:

```jsx
<UnleashClassFlagProvider
  flagName="demoApp.step1"
  render={({ isEnabled, getClient }) => (
    <MyClassComponent isEnabled={isEnabled} getClient={getClient} />
  )}
/>
```

## React Native

### localStorage

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
    },
  },
};
```

### startTransition

If your version of React Native doesn't support `startTransition`, you can provide fallback implementation:
```jsx
  <FlagProvider startTransition={fn => fn()} ></FlagProvider>
```

# Migration guide

## Upgrade path from v1 -> v2

If you were previously using the built in Async storage used in the unleash-proxy-client-js, this no longer comes bundled with the library. You will need to install the storage adapter for your preferred storage solution. Otherwise there are no breaking changes.

## Upgrade path from v2 -> v3

Previously the unleash client was bundled as dependency directly in this library. It's now changed to a peer dependency and listed as an external.

In v2 there was only one distribution based on the fact that webpack polyfilled the necessary features in v4. This is no longer the case in webpack v5. We now provide two distribution builds, one for the server and one for the client - and use the browser field in the npm package to hint module builders about which version to use. The default `dist/index.js` file points to the node version, while the web build is located at `dist/index.browser.js`

Upgrading should be as easy as running yarn again with the new version, but we made the made bump regardless to be safe. Note: If you are not able to resolve the peer dependency on `unleash-proxy-client` you might need to run `npm install unleash-proxy-client`

## Upgrade path from v3 -> v4

`startClient` option has been simplified. Now it will also work if you don't pass custom client with it. It defaults to `true`.

#### Note on v4.0.0:
The major release is driven by Node14 end of life and represents no other changes.  From this version onwards we do not guarantee that this library will work server side with Node 14.

##  Design philosophy
This feature flag SDK is designed according to our design philosophy. You can [read more about that here](https://docs.getunleash.io/topics/feature-flags/feature-flag-best-practices).

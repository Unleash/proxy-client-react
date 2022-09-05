# DISCLAIMER:

This library is meant to be used with the [unleash-proxy](https://github.com/Unleash/unleash-proxy). The proxy application layer will sit between your unleash instance and your client applications, and provides performance and security benefits. DO NOT TRY to connect this library directly to the unleash instance, as the datasets follow different formats because the proxy only returns evaluated toggle information.

# Installation

```bash
npm install @unleash/proxy-client-react unleash-proxy-client
// or
yarn add @unleash/proxy-client-react unleash-proxy-client
```
# Upgrade path from v1 -> v2
If you were previously using the built in Async storage used in the unleash-proxy-client-js, this no longer comes bundled with the library. You will need to install the storage adapter for your preferred storage solution. Otherwise there are no breaking changes.

# Upgrade path from v2 -> v3
Previously the unleash client was bundled as dependency directly in this library. It's now changed to a peer dependency and listed as an external.

In v2 there was only one distribution based on the fact that webpack polyfilled the necessary features in v4. This is no longer the case in webpack v5. We now provide two distribution builds, one for the server and one for the client - and use the browser field in the npm package to hint module builders about which version to use. The default `dist/index.js` file points to the node version, while the web build is located at `dist/index.browser.js`

Upgrading should be as easy as running yarn again with the new version, but we made the made bump regardless to be safe. Note: If you are not able to resolve the peer dependency on `unleash-proxy-client` you might need to run `npm install unleash-proxy-client`

# Initialization

Import the provider like this in your entrypoint file (typically index.js/ts):

```jsx
import { createRoot } from 'react-dom/client';
import { FlagProvider } from '@unleash/proxy-client-react';

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev',
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

Alternatively, you can pass your own client in to the FlagProvider:

```jsx
import { createRoot } from 'react-dom/client';
import { FlagProvider, UnleashClient } from '@unleash/proxy-client-react';

const config = {
  url: 'https://HOSTNAME/proxy',
  clientKey: 'PROXYKEY',
  refreshInterval: 15,
  appName: 'your-app-name',
  environment: 'dev',
};

const client = new UnleashClient(config);
const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <FlagProvider unleashClient={client}>
      <App />
    </FlagProvider>
  </React.StrictMode>
);
```

## Deferring client start

By default, the Unleash client will start polling the Proxy for toggles immediately when the `FlagProvider` component renders. You can delay the polling by:
- setting the `startClient` prop to `false`
- passing a client instance to the `FlagProvider`

```jsx
root.render(
  <React.StrictMode>
    <FlagProvider unleashClient={client} startClient={false}>
      <App />
    </FlagProvider>
  </React.StrictMode>
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

## Usage with class components
Since this library uses hooks you have to implement a wrapper to use with class components. Beneath you can find an example of how to use this library with class components, using a custom wrapper:

```jsx
import React from "react";
import {
  useFlag,
  useUnleashClient,
  useUnleashContext,
  useVariant,
  useFlagsStatus
} from "@unleash/proxy-client-react";

interface IUnleashClassFlagProvider {
  render: (props: any) => React.ReactNode;
  flagName: string;
}

export const UnleashClassFlagProvider = ({
  render,
  flagName
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
        getFlagsStatus
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

## Server-side rendering (SSR) / Next.js

> **Notice:** This client SDK _can_ be used with server-side rendering (SSR). However, it does require you to make certain changes, as detailed below. First-class support for SSR is something we'd like to look into, but it is not prioritized at the moment. If you'd like to help us improve the support, let us know in an issue/PR or [on Slack](slack.unleash.run)!
>
> The code samples below are adapted from issues [#40](https://github.com/Unleash/proxy-client-react/issues/40#issuecomment-1048761755 "GitHub issue #40") and [#50](https://github.com/Unleash/proxy-client-react/issues/50 "GitHub issue #50"). Refer to the issues for more information and context.

You can use the client for server-side rendering in a few different ways, each of which have their own advantages and drawbacks. The three main ways are:

| Method                                                           | Advantage                                                 | Drawback                                                                                                               |
|------------------------------------------------------------------|-----------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------|
| Per-request toggle fetching                                      | You'll always get the most up-to-date toggle state.       | You must wait for the client to start and to fetch toggles before rendering.                                           |
| Global server-side Unleash client                                | You can render pages server-side  with toggles evaluated. | The toggle state can be as old as the defined refresh interval.                                                        |
| Defer starting the client until the page is rendered client-side | Less work to implement, faster response times.            | The work is pushed to the client side, so the features the end-user see might change after the client is instantiated. |

The examples below are tailored towards Next.js, but you should be able to adopt them to other settings.

If you want to use this client to evaluate feature client-side, then you need to provide an alternative implementation of `fetch`, using the configuration's `fetch` property, and a storage provider, using the `storageProvider` property. By default, this client tries to use `window.fetch` to retrieve toggles for evaluation and `window.localStorage` as a storage provider, but `window` isn't available during server-side rendering.

### Prefetching toggles (Next.js)

<!-- Todo: explain what this is and how it works -->

```js
export async function getServerSideProps() {
  // Set up unleash to fetch only once in order to not create
  // bindings for every request (which would cause a memory leak)
  const unleash = new UnleashClient({
    ...config, // whatever the rest of your configuration is
    fetch, // use a custom fetch implementation
    storageProvider: new InMemoryStorageProvider(), // use a custom in-memory storage provider
    disableMetrics: true, // don't send metrics
    disableRefresh: true // don't refresh
  });

  // optionally update context
  unleash.updateContext({ userId: '123' });

  // await start to make sure the toggles have been fetched
  await unleash.start();

  // get all toggles
  const toggles = unleash.getAllToggles();


  return {
    props: {
      toggles,
    },
  };
}
```

And then

```js
// sample config
const config = {
  url: 'https://app.unleash-hosted.com/demo/proxy',
  clientKey: 'proxy-123',
  appName: 'ssr',
  projectName: 'default',
  refreshInterval: 1000,
  environment: 'dev',
};

function MyApp({ Component, pageProps }) {
  // override fetch and storageProvider when `window` is `'undefined'`
  const ssrOption = typeof window !== "undefined"
    ? {}
    : { fetch: fetch, storageProvider: new InMemoryStorageProvider() };

  const client = new UnleashClient({
    ...config,
    ...ssrOption,
    bootstrap: pageProps.toggles,
  });
//

  return (
    <FlagProvider unleashClient={client}>
      <Component {...pageProps} />
    </FlagProvider>
  );
}
```

# WORK IN PROGRESS

This library is work in progress and not ready for use. In order to test it out follow the following steps:

1. Clone the repository
2. Run yarn
3. Run yarn build
4. Run yarn link
5. Create a new react project or use existing react project. Run yarn link 'unleash-proxy-react' in the project folder.

Import the provider like this in index.js:

```
import FlagProvider from 'unleash-proxy-react';

const config = {
  url: 'https://HOSTNAME/api/proxy',
  clientKey: 'SECRET',
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

To check if a feature is enabled:

```
import { useFlag } from 'unleash-proxy-react';

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

```
import { useVariant } from 'unleash-proxy-react';

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

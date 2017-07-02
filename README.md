# React bases

 [![Greenkeeper badge](https://badges.greenkeeper.io/wix/react-bases.svg)](https://greenkeeper.io/)
 [![Build Status](https://travis-ci.org/wix/react-bases.svg?branch=master)](https://travis-ci.org/wix/react-bases)

This library exports a class mixer,  react component mixins and several base -component falvors.



# how to install

```
npm install react-bases
```



# how to use

 - base components
 - [mixins](./docs/mixins.md)
 - [class-mixer](./docs/class-mixer.md)
 - [react-mixer](./docs/react-mixer.md)


## config

global and local config allow passing data/flags to mixins in a specific render context (e.g. a specific server side page render)

### avaialble configurations:
our mixins support the following flags:
- staticRendering: boolean, false by default, when true mixins will not activate event listeners/reactions
- debug: boolean
- add your own cool config key here...



```ts
import {setGlobalConfig} from 'react-bases';

setGlobalConfig({staticRendering:true});
```



## runInContext
the runInConext method allows running mixins inside a context with specific config.
it also resets the config and the mixin data after running.

use this option in your server-side rendering and tests

```tsx
import {runInContext} from 'react-bases';.


runInContext({staticRendering:true},()=>{
    React.renderToString(<div></div>)
});

```




### arguments:

- config: a mixins config object
- method: a method to run in this context
    - if this method returns a promise, the context will remain active until the promise is resolved/rejected, you should use this option only in tests








# available base components

ObserverComonent


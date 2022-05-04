## Install
```
npm i --save @bitfi/dag4-bitfi
```

## Signin
```
import { BitfiBridge, calculateCode } from '@bitfi/dag4-bitfi'
import * as CryptoJS from 'crypto';

// appSecret . It MUST BE stored by the extension and keep secret
// Nor appSecret, nor authToken exposes users private keys.

const appSecret = CryptoJS.randomBytes(32).toString('hex')
const randomSigningData = CryptoJS.randomBytes(16).toString('hex')
const deviceId = 'FFFFFF'

// The code should be displayed to user so it can compare it to the code on his device
const code = calculateCode(
  randomSigningData,
  appSecret,
  deviceId
)

console.log(`Check the code on your device: ${code}`)

//Each install/instance of this will establish a private key for exclusive use, 
//holding onto this so not in purview of Bitfi system. User devices 
//privately retain corresponding public keys for their elected extensions and the 
//hardware will effectively refuse blind requests in the absence of prior //registration.

const bridge = await BitfiBridge.signin({
  appSecret,
  randomSigningData,
  url: 'URL',
  deviceId,
  config: {
    apiUrl: 'API_URL',
    envoyUrl: 'ENVOY_URL'
  },
  //optional callback
  onMessage: m => {
    //message from device
    console.log(m)
  },
  //optional callback
  onNotified: () => console.log('notified!')
})
  
```
![image](https://user-images.githubusercontent.com/68479312/166811492-0e87278a-f554-47ac-9b94-19d364c662c0.png)


## Signin offline
```
const authToken = 'authToken'
const publiKey = 'public key'
const appSecret = 'app sectey'
const secret = 'secret'

const bridge = await BitfiBridge.signingOffline(
  authToken, 
  publiKey, 
  secret, 
  {
    apiUrl: 'API_URL',
    envoyUrl: 'ENVOY_URL'
  }
)
```

## Get address / public_key
```
bridge.getPublicKey()
bridge.getAccount()
```

## Sign a message (prefixed)
```
const prefixedSignature = await bridge.signMessagePrefixed("hello", console.log)
```

## Sign a message (blind)
```
const blindSignature = await bridge.signMessageBlind("hello", console.log)
```

## Build a transaction
```
const tx = await bridge.buildTx("1", "0", "dag address", console.log)
```

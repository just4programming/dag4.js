## Signin
```
const bridge = await BitfiBridge.signin('wss://bitfi.com/NoxWSHandler/NoxWS.ashx', {
  deviceId: 'DEVICE_ID',  
  apiUrl: 'API_URL',
  envoyUrl: 'ENVOY_URL'
})
```

## Get accounts
```
const accounts = await bridge.getAccounts()
```

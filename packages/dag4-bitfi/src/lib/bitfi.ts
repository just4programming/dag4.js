import axios from 'axios'
import { w3cwebsocket } from 'websocket'
import * as base64 from './base64';

const WebSocket = w3cwebsocket;

export type BitfiConfig = {
  envoyUrl: string,
  apiUrl: string,
  deviceId?: string
}

export class Bitfi {
  private _config: BitfiConfig
  private _authToken: string

  private constructor(authToken: string, config: BitfiConfig) {
    this._config = config
    this._authToken = authToken
  }

  private receiveEnvoy = <T>(envoyToken: string): Promise<any> => {
    console.log(`Envoy: ${envoyToken}`)
    console.log('Staring envoy')
    var running = false
      
    return new Promise((res, rej) => {
      var websocket = new WebSocket(this._config.envoyUrl);
  
      websocket.addEventListener("open", function (event) {
        websocket.send(JSON.stringify({ ClientToken: envoyToken }));
        running = true;
        //monitor();
      });
  
      websocket.addEventListener("message", function (e) {
        console.log(e.data)
  
        var obj = JSON.parse(e.data);
        var message = obj.Message;
  
        if (message && obj.Completed) {
          websocket.close()
          res(JSON.parse(base64.decode(message)))
        }
  
        const error = obj.Error;
  
        if (error) {
          running = false;
          websocket.close()
          rej(error)
        }
      })
    })
  }
  

  public signMessage = async (message: string, address: string): Promise<any> => {
    let envoyToken = ''
  
    try {
      const { data } = await axios.post(this._config.apiUrl, {
        authToken: this._authToken,
        method: 'SignMessage',
        messageModel: {
          MessageRequest: {
            Message: message,
            Address: address,
            Symbol: 'dag',
          }
        }
      })
  
      if (data && data.error) {
        throw new Error(data.error && data.error.message)
      }
  
      if (!data && typeof data !== 'string') {
        throw new Error("Not valid envoy token")
      }
  
      envoyToken = data
    }
    catch (exc) {
      throw new Error(`Unable to fetch envoy token: ${JSON.stringify(exc && exc.message)}`)
    }
  
    return this.receiveEnvoy<string>(envoyToken)
  }
  
  public createSignedTransaction = async (amountBtc: string, fromAddress: string, toAddress: string): Promise<string> => {
    let envoyToken = ''
  
    try {
      const { data } = await axios.post(this._config.apiUrl, {
        authToken: this._authToken,
        method: 'Transfer',
        transferModel: {
          Info: {
            From: fromAddress,
            To: toAddress,
            "TokenAddr": null,
            "Symbol":"DAG",
            "Amount":{
              "Sat":"0",
              "Btc": amountBtc
            },
            "Fee":{
              "Sat":"0",
              "Btc":"0"
            },
            "Addition":{
              "PaymentId":null,
              "DestTag":null,
              "FeePriority":null,
              "Memo":null
            }
          }
        }
      })
  
      if (data && data.error) {
        throw new Error(data.error && data.error.message)
      }
  
      if (!data && typeof data !== 'string') {
        throw new Error("Not valid envoy token")
      }
  
      envoyToken = data
    }
    catch (exc) {
      throw new Error(`Unable to fetch envoy token: ${JSON.stringify(exc && exc.message)}`)
    }
  
    return this.receiveEnvoy<string>(envoyToken)
  }
    
  public static signin = (noxUrl: string, config: BitfiConfig): Promise<Bitfi> => {
    return new Promise((res, rej) => {
      let websocket = new WebSocket(noxUrl);
  
      var request_type = "EXTAPI:";
      var request = request_type.concat(config.deviceId);
      
      websocket.addEventListener('open', function (event) {
        websocket.send(request);
      });
      
      websocket.addEventListener('message', async function (e) {
        
        const response = JSON.parse(e.data)
        
        if (response.DisplayToken) {
          console.log(response.DisplayToken)
        }
        
        console.log(response)
        if (response.Completed) {
          const token = response.ExchangeToken 

          try {
            const bitfi = await Bitfi.signinWithToken(token, config)
            res(bitfi)
          }
          catch (exc) {
            rej(exc)
          }
          finally {
            websocket.close()
          }
        }
  
        if (response.Error) {
          console.log(response.Error)
          websocket.close()
          rej(response.Error)
        }
      });
    })
  };

  public static signinWithToken = async (token: string, config: BitfiConfig) => {

    const bitfi = new Bitfi(token, config)
    const valid = await bitfi.get('IsTokenValid')

    if (!valid)
      throw new Error('Invalid token, sign in again')

    return bitfi
    
  }
  
  public get = async (method: 'GetAddresses' | 'IsTokenValid', params = undefined) => {
    const res = await axios.post(this._config.apiUrl, {
      authToken: this._authToken,
      method,
      transferModel: params
    })

  
    if (res.data.error)
      throw new Error(res.data.error)
  
    return res.data.Content || res.data.content || res.data
  }
  
}




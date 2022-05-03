// max length in bytes.
import {dag4} from '@stardust-collective/dag4';
import { BitfiConfig, Bitfi } from './lib/bitfi'

export class BitfiBridge {
  private _bitfi: Bitfi

  private constructor(private bitfi: Bitfi) {
    this._bitfi = bitfi 
  }

  async buildTx (amount: number, publicKey: string, bip44Index: number, fromAddress: string, toAddress: string) {
    const tx = await this._bitfi.createSignedTransaction(amount.toString(), fromAddress, toAddress)
    return tx;
  }

  /**
   * Returns a signed transaction ready to be posted to the network.
   */
  async signTransaction(publicKey: string, address: string, hash: string, ledgerEncodedTx: string) {
    const results = await this.sign(ledgerEncodedTx, address);
    //console.log('signTransaction\n' + results.signature);
    //const success = dag4.keyStore.verify(publicKey, hash, results.signature);
    //console.log('verify: ', success);
    return results.signature;
  }

  /**
   * Takes a signed transaction and posts it to the network.
   */
  postTransaction() {}

  // getPublicKeys
  public async getAccounts (/*startIndex = 0, numberOfAccounts = 8, progressUpdateCallback?: (progress: number) => void*/) {
    const accounts = await this._bitfi.get('GetAddresses')
    return accounts
  }

  // getAccountInfoForPublicKeys
  public async getAccountInfo(accounts: string[]) {

    if (accounts.length > 0) {
      let responseArray = [];
      for (let i = 0; i < accounts.length; i++) {
        const address = accounts;
        const balance = (await dag4.account.getBalance() || 0);
        const response = {
          address,
          //publicKey,
          balance: balance
        };
        responseArray.push(response);
      }
      return responseArray;
    } else {
      throw new Error('No accounts found');
    }
  }

  public static async signin(noxUrl: string, config: BitfiConfig): Promise<BitfiBridge> {
    const bitfi = await Bitfi.signin(noxUrl, config)
    return new BitfiBridge(bitfi)
  }

  public static async signinWithToken(token: string, config: BitfiConfig): Promise<BitfiBridge> {
    const bitfi = await Bitfi.signinWithToken(token, config)
    return new BitfiBridge(bitfi)
  }

  private async sign(message: string, address: string) {
    const res = await this._bitfi.signMessage(message, address)

    if (res && res.success && res.SignatureResponse) {
      return {
        success: res.success,
        message,
        signature: res.SignatureResponse,
      };
    }

    throw new Error("Unable to sign a message")
  }
}


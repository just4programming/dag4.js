import {ethers} from 'ethers';
import { Contract, Signer } from 'ethers';

import BalanceCheckerABI from './abis/BalanceChecker.abi.json';
import MetaABI from './abis/Meta.abi.json';
import BigNumber from 'bignumber.js';

type Provider = ethers.providers.Provider;

interface Options {
  contractAddress?: string;
}

type BalanceMap = {
  [tokenAddress: string]: string;
}

type AddressBalanceMap = {
  [address: string]: BalanceMap;
}

const TOKEN_BALANCE_CONTRACT = '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39';

const NETWORK_TO_CONTRACT_MAP = {
  1: '0xb1f8e55c7f64d203c1400b9d8555d050f94adf39',
  3: '0x8D9708f3F514206486D7E988533f770a16d074a7',
  4: '0x3183B673f4816C94BeF53958BaF93C671B7F8Cf2'
}

export class TokenContractService {

  formatAddressBalances<T> (values: T[], addresses: string[], tokens: string[]) {
    const balances: AddressBalanceMap = {};
    addresses.forEach((addr, addrIdx) => {
      balances[addr] = {};
      tokens.forEach((tokenAddr, tokenIdx) => {
        const balance = values[addrIdx * tokens.length + tokenIdx];
        balances[addr][tokenAddr] = balance.toString();
      });
    });
    return balances;
  }


  async getAddressBalances (provider: Provider | Signer, ethAddress: string, tokenContractAddress: string[], chainId = 1) {

    const contract = new Contract(
      NETWORK_TO_CONTRACT_MAP[chainId],
      BalanceCheckerABI as any,
      provider
    );

    const balances = await contract.balances([ethAddress], tokenContractAddress);

    return this.formatAddressBalances<BigNumber>(balances, [ethAddress], tokenContractAddress)[ethAddress];
  }

  async getTokenBalance(provider: Provider | Signer, ethAddress: string, tokenContractAddress: string, chainId = 1) {

    const contract = new Contract(
      NETWORK_TO_CONTRACT_MAP[chainId],
      BalanceCheckerABI as any,
      provider
    );

    const balances = await contract.balances([ethAddress], [tokenContractAddress]);

    return this.formatAddressBalances<BigNumber>(balances, [ethAddress], [tokenContractAddress])[ethAddress];
  }


  async getTokenInfo (
    provider: Provider | Signer,
    tokenContractAddress: string
  ) {

    let name = '', decimals, symbol;

    const contract = new Contract(tokenContractAddress, MetaABI as any, provider);

    try {
      decimals = await contract.decimals();
      symbol = await contract.symbol();
      name = await contract.name();
    }
    catch (e) {
      throw new Error(e.message);
    }

    return {
      address: tokenContractAddress,
      decimals,
      symbol,
      name
    }
  }
}


export const tokenContractService = new TokenContractService();

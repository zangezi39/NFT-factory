import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' ) {
  web3 = new Web3(window.ethereum);
  ethereum.request({ method: 'eth_requestAccounts' });
} else {
  const provider = new Web3.providers.HttpProvider(
    //Matic mainnet:
    'https://rpc-mainnet.maticvigil.com/v1/a483c2d11eff001ede1aeecc5e7b0cb14f689b96'
    //Matic Mumbai testnet:
    //'https://rpc-mumbai.maticvigil.com/v1/a483c2d11eff001ede1aeecc5e7b0cb14f689b96'
  );
  web3 = new Web3(provider);
}

export default web3;

import detectEthereumProvider from '@metamask/detect-provider';
import { ethers, Contract } from 'ethers';
import NftFactory from './build/NftFactory';

const getBlockchain = () =>
  new Promise( async (resolve, reject) => {
    let provider = await detectEthereumProvider();
    if(provider) {
      await provider.request({ method: 'eth_requestAccounts' });
      const networkId = await provider.request({ method: 'net_version' })
      provider = new ethers.providers.Web3Provider(provider);
      const signer = provider.getSigner();
      const NftFactory = new Contract(
        '0x8BBAa5Fa6D8c5A030f221CEDA851646f432918d4',
        NftFactory,
        signer
      );
      resolve({NftFactory});
      return;
    }

  reject('Install Metamask');
});

export default getBlockchain;

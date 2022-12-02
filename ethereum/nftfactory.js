import web3 from './web3';
import NFTFactory from './build/NftFactory.json';

const nftfactory = new web3.eth.Contract(
  NFTFactory.abi,
  '0x8BBAa5Fa6D8c5A030f221CEDA851646f432918d4' //NFTFactory deployed contract address
);

export default nftfactory;

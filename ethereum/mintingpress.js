import web3 from './web3';
import MintingPress from './build/MintingPress.json';

const mint = (address) => {
  return new web3.eth.Contract(
    MintingPress.abi,
    address
  );

  console.log('addr:', address);
}

export default mint;

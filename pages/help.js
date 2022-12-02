import React, { Component } from 'react';
import { Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import Web3 from 'web3';

class Help extends Component {
  render() {
    return (
      <div>
        <Container>
          <label><h1>setup help:</h1></label>
          <br />
          <ol>
            <li value="number"><a href="https://metamask.io/download" target="_blank">
              Follow instructions to set up the MetaMask wallet on your browser;
            </a></li>
            <li value="number"><a href="https://docs.matic.network/docs/develop/metamask/config-polygon-on-metamask/" target="_blank">
              Configure Metamask to connect to Polygon (MATIC) MainNet;
            </a></li>
            <li value="number"><a href="/howtofundwallet" target="_blank">
              Buy some MATIC tokens on a crypto exchange (one will be enough) and add to the Metamask;</a></li>
            <li value="number"><a href="https://nft.storage/#getting-started" target="_blank">
              Set up a NFT Storage account and create an API access key. Copy-paste it someplace safe - you will need it to create a Minting Press
            </a></li>
          </ol>
        </Container>
      </div>
    )
  }
}

export default Help;

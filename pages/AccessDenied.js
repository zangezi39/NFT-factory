import React, { Component } from 'react';
import { Button, Container } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import Web3 from 'web3';
import FactoryHeader from '../components/FactoryHeader';

class AccessDenied extends Component {
  render() {
    return (
      <div>
        <FactoryHeader />
        <Container>
          <label><h2>ERROR: Access Denied</h2></label>
          <br />
          <h3>
            <label>This MintingPress administration page is restricted to its admin,
            token owners, approved managers and operators. Some of the possible causes
            you are receiving this error might be:</label>
            <br />
            <ol>
              <li value="number"> You are not authorized to access the dashboard;</li>
              <li value="number"> You are trying to access wrong NFT;</li>
              <li value="number"> You are not logged into MetaMask wallet;</li>
              <li value="number"> MetaMask network is not set to MATIC MAINNET;</li>
              <li value="number"> Incorrect MetaMask account is selected.</li>
            </ol>
            <label>Please correct the problem and try again.</label>
          </h3>
        </Container>
      </div>
    )
  }
}

export default AccessDenied;

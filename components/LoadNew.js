import React, { Component } from 'react';
import { Button, Dropdown, Form, Icon, Menu, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import nftfactory from '../ethereum/nftfactory';
import Web3 from 'web3';
import Link from 'next/link';
import Router from 'next/router';

class LoadNew extends Component {
  state = {
    address: ''
  }

  async componentDidMount() {
    const symbols = await nftfactory.methods.getSymbols().call();
    const _idx = symbols.length - 1;
    const newAddress = await nftfactory.methods.getContractBySymbol(symbols[_idx]).call();
    this.setState({ address: newAddress });
    Router.push({
      pathname: "/mintingpress/[mint]",
      query: {
        mint: this.state.address
      }
    });
  }
}

export default LoadNew;

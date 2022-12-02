import React, { Component } from 'react';
import { Container, Menu, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import nftfactory from '../ethereum/nftfactory';
import MintingPress from '../ethereum/mintingpress';
import Web3 from 'web3';
import Link from 'next/link';
import Router from 'next/router';

class PressHeader extends Component {

  state = {
    account: '',
    activeItem: '',
    address: '',
    pName: '',
    pSymbol: '',
  }

  async componentDidMount() {
    const { path, id, acct } = this.props;
    const acc = await web3.eth.getAccounts();
    const _address = await nftfactory.methods
      .getContractAddress(this.props.path).call();
    const press =  await MintingPress(_address);
    const admin = await press.methods.admin().call();
    const pName = await press.methods.pName().call();
    const pSymbol = await press.methods.pSymbol().call();
    const _access1 = await press.methods.getAccess(acc[0], 1).call();
    const _access2 = await press.methods.getAccess(acc[0], 2).call();
    const _access3 = await press.methods.getAccess(acc[0], 3).call();
    if (acc[0] != admin) {
      this.setState({ disabledMint: true});
    };
    if (_access1 == false && _access2 == false) {
      this.setState({
        disabledApprove: true
      });
    }
    if (
      _access1 == false &&
      _access2 == false &&
      _access3 == false
    ) {
      this.setState({
        disabledSell: true,
        disabledTransfer: true,
        disabledBurn: true
      });
    };

    this.setState({
      activeItem: this.props.id,
      address: _address,
      pName: pName,
      pSymbol: pSymbol
    });
  }

  render() {
    const { activeItem } = this.state;
    return (
      <Container>
        <div>
          <Segment>
            <label><h1>&nbsp;&nbsp;&nbsp;{this.state.pName} &nbsp;({this.state.pSymbol})</h1></label>
            <br />
            <Menu tabular>
              <Link href={{
                pathname: "/[mint]",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item name='home' active={activeItem === 'home'}>Home</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/mint",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='mint'
                  active={activeItem === 'mint'}
                  disabled={this.state.disabledMint}
               >Mint</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/sell",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='sell'
                  active={activeItem === 'sell'}
                  disabled={this.state.disabledSell}
                >Sell</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/transfer",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='transfer'
                  active={activeItem === 'transfer'}
                  disabled={this.state.disabledTransfer}
                >Transfer</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/approve",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='approve'
                  active={activeItem === 'approve'}
                  disabled={this.state.disabledApprove}
                >Approve</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/burn",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='burn'
                  active={activeItem === 'burn'}
                  disabled={this.state.disabledBurn}
                >Burn</Menu.Item>
              </Link>
              <Link href={{
                pathname: "/[mint]/faq",
                query: {
                  mint: this.props.path
                }
              }}>
                <Menu.Item
                  name='faq'
                  active={activeItem === 'faq'}
                >FAQ</Menu.Item>
              </Link>
            </Menu>
            {this.props.children}
          </Segment>
        </div>
      </Container>

    )
  }
}

export default PressHeader;

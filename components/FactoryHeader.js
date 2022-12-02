import React, { Component } from 'react';
import { Button, Container, Dropdown, Form, Icon, Menu, Segment } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import nftfactory from '../ethereum/nftfactory';
import Web3 from 'web3';
import Link from 'next/link';

class FactoryHeader extends Component {
  state = {
    choices: [],
    path: ''
  }

  async componentDidMount() {
    const symbols = await nftfactory.methods.getSymbols().call();
    const choices = [];
    let i;
    for(i = 0; i < symbols.length; i++) {
      function _obj(key, text, value) {
        this.key = key;
        this.text = text;
        this.value = value;
      }
      const _path = await nftfactory.methods.getContractBySymbol(symbols[i]).call();
      const choice = new _obj(
        symbols[i],
        symbols[i],
        _path
      )
      choices.push(choice);
    }
    const sorted = choices.sort((a, b) => {
      if (a.key < b.key) { return -1; }
      if (a.key > b.key) { return 1; }
      return 0;
    });
    this.setState({
      choices: sorted
    });
  }

  render() {
    const onDropDownSelect = async (event, data) => {
      const _selectName = await
      this.setState({
        path: data.value
      });
    }

    return (
      <div>
        <Container>
          <Menu style={{ marginTop: '10px', marginBottom: '25px', height: '46px' }} >
            <Menu.Menu position="left" >
              <Link href="/">
                <a className="item"><h3>&nbsp;&nbsp;Home&nbsp;&nbsp;</h3></a>
              </Link>
            </Menu.Menu>
            <Menu.Menu position="left">
              <Dropdown
                placeholder="&nbsp;Select NFT symbol...&nbsp;"
                selection
                search
                options={this.state.choices}
                onChange={onDropDownSelect}
              />
            </Menu.Menu>
            <Menu.Menu position="left">
              <Link href={{
                pathname: "/[mint]",
                query: {
                  mint: this.state.path
                }
              }}>
                <a className="item"><h3>&nbsp;&nbsp;Go to Dashboard&nbsp;&nbsp;</h3></a>
              </Link>
            </Menu.Menu>
            <Menu.Menu position="right">
              <Link href="/help">
                <a className="item"><h3>&nbsp;&nbsp;Help&nbsp;&nbsp;</h3></a>
              </Link>
            </Menu.Menu>
          </Menu>
        </Container>
      </div>
    );
  }
}

export default FactoryHeader;

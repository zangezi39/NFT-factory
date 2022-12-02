import React, { Component } from 'react';
import {
  Card,
  Checkbox,
  Dropdown,
  Form,
  Grid,
  Button,
  Icon,
  Input,
  Message,
  Popup,
  Segment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../../ethereum/web3';
import nftfactory from '../../ethereum/nftfactory';
import MintingPress from '../../ethereum/mintingpress';
import PressHeader from '../../components/PressHeader';
import {
  returnGalleryItems,
  returnTokenChoices,
  returnTokensOwned
} from '../../components/scripts';
import Web3 from 'web3';
import IPFS from 'ipfs';
import { NFTStorage, File, Blob } from "nft.storage";

export async function getServerSideProps(context) {
  const path = context.query.mint;
  return { props: { path } };
}

class MintingPressApp extends Component {

  state = {
    account: '',
    address: '',
    fullList: [],
    id: 'home',
    pName: '',
    press: '',
    author: '',
    listId: '',
    ownerId: '',
    ownerInput: false,
    viewOption: 'all',
    pDescr: '',
    pSymbol: '',
    manager: '',
    tokenList: [],
    tokenChoices: [],
    totalSupply: '',
    operator: ''
  }

  async componentDidMount() {
    const acc = await web3.eth.getAccounts();
    const address = await nftfactory.methods
      .getContractAddress(this.props.path).call();
    const press =  await MintingPress(address);
    const pName = await press.methods.pName().call();
    const author = await press.methods.author().call();
    const pDescr = await press.methods.descr().call();
    const pSymbol = await press.methods.pSymbol().call();
    const manager = await press.methods.admin().call();
    const totalSupply = await press.methods.totalSupply().call();
    const operator = await press.methods.getOperator(manager).call();
    const tokenList = await press.methods.getTokenList().call();

    this.setState({
      account: acc[0],
      address: address,
      pName: pName,
      author: author,
      pDescr: pDescr,
      press: press,
      pSymbol: pSymbol,
      manager: manager,
      tokenChoices: await returnTokenChoices(press),
      tokenList: tokenList,
      totalSupply: totalSupply,
      operator: operator
    });
  }

  onListSubmit = async event => {
    event.preventDefault();
    const { viewOption } = this.state;
    const press = this.state.press;
    const fullList = await press.methods.getTokenList().call();
    if (this.state.viewOption == 'all') {
      this.setState({ tokenList: fullList });
    }
    if (this.state.viewOption == 'buy') {
      let buyList = [];
      let i;
      for (i = 0; i < fullList.length; i++) {
        const _price = await press.methods.getPrice(fullList[i]).call();
        if (_price > 0) {
          buyList.push(fullList[i]);
        }
      }
      this.setState({ tokenList: buyList });
    }
  }

  onOwnedTokensSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading3: true,
      errorMessage3: '',
      viewOption: 'own'
    });
    const press = this.state.press;
    const { ownerId } = this.state;
    let _ownerId;
    if (this.state.ownerId == '') {
      _ownerId = this.state.account;
    } else {
      _ownerId = this.state.ownerId;
    }
    if (web3.utils.isAddress(_ownerId) == true) {
      const _balance = await press.methods.balanceOf(_ownerId).call();
      if (_balance > 0) {
        this.setState({
          loading3: false,
          tokenList: await returnTokensOwned(press, _ownerId)
        });
      } else {
        this.setState({
          loading3: false,
          errorMessage3: 'Please enter a valid address'
        });
      }
    } else {
      this.setState({
        loading3: false,
        errorMessage3: 'Please enter an address'
      });
    }
  }

  render() {
    return (
      <div>
        <PressHeader
          path={this.props.path}
          id={this.state.id}
          acct={this.state.account}
        >
          <br />
          <label><h3>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.pDescr} by {this.state.author}</h3></label>
          <label><h3>&nbsp;&nbsp;&nbsp;&nbsp;{this.state.address}</h3></label>
          <br />
          <label><h3>&nbsp;&nbsp;&nbsp;&nbsp;Managed by: {this.state.manager}</h3></label>
          <label><h3>&nbsp;&nbsp;&nbsp;&nbsp;Total number of minted tokens: {this.state.totalSupply}</h3></label>
          <br />
          <Segment>
          <label><h4>&nbsp;&nbsp;&nbsp;&nbsp;View Options:</h4></label>
          <br />

          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column width={6}>
                <Form>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Checkbox
                    radio
                    label={`View all ${this.state.pSymbol} tokens`}
                    name='viewOptions'
                    value='all'
                    onChange={event => this.setState({ viewOption: 'all' })}
                    checked={this.state.viewOption === 'all'}
                    onClick={this.onListSubmit}
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={6}>
                <Form>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Checkbox
                    radio
                    label='View tokens for sale only'
                    name='viewOptions'
                    value='buy'
                    onChange={event => this.setState({ viewOption: 'buy' })}
                    checked={this.state.viewOption === 'buy'}
                    onClick={this.onListSubmit}
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={6}>
                <Form error={this.state.errorMessage}>
                  &nbsp;&nbsp;&nbsp;&nbsp;
                  <Checkbox
                    radio
                    label='Search for token:'
                    name='viewOptions'
                    value='own'
                    onChange={event => this.setState({ viewOption: 'one' })}
                    checked={this.state.viewOption === 'one'}
                    onClick={this.onListSubmit}
                  />
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Form>
                  <Dropdown
                    selection
                    selection
                    fluid
                    search
                    options={this.state.tokenChoices}
                    onChange={(event, data) => {
                      let _tempList = []
                      _tempList.push(data.value.toString())
                      this.setState({
                        viewOption: 'one',
                        tokenList: _tempList
                      })
                    }}
                  />
                </Form>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={6}>
                <Form error={!!this.state.errorMessage2}>
                  <Form.Field>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <Checkbox
                      radio
                      label='Search for tokens by address (leave blank for own):'
                      name='viewOptions'
                      value='own'
                      onChange={event => this.setState({ viewOption: 'own' })}
                      checked={this.state.viewOption === 'own'}
                      onClick={this.onListSubmit}
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>
              <Grid.Column>
                <Form>
                  <Form.Field>
                    <Input
                      action={{ icon: 'search', onClick: this.onOwnedTokensSubmit }}
                      placeholder='Enter address...'
                      value={this.state.ownerId}
                      onChange={event => this.setState({
                        ownerId: event.target.value,
                        viewOption: 'own'
                      })}
                      floated='right'
                    />
                  </Form.Field>
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          <br /><br />
          <Card.Group>
            {returnGalleryItems(
              this.props.path,
              this.state.tokenList,
              this.state.press
            )}
          </Card.Group>
          </Segment>
        </PressHeader>
      </div>
    )
  }
}
export default MintingPressApp;

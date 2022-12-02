import React, { Component } from 'react';
import { Button, Card, Grid, Image, Popup} from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Web3 from 'web3';
import axios from 'axios';
import MetaDataFetch from './MetaDataFetch';

class ListTokens extends Component {
  state = {
    account: '',
    metadata: [],
    asset: '',
    jsonUrl: '',
    price: 'Not for sale',
    royalty: ''
  }

  async componentDidMount() {
    const acc = await web3.eth.getAccounts();
    const { id, press } = this.props;
    const mintingpress= this.props.press;
    const _price = await mintingpress.methods.getPrice(this.props.id).call();
    const royalty = await mintingpress.methods.getRoyalties(this.props.id).call();
    const tokenOwner = await mintingpress.methods.ownerOf(this.props.id).call();
    const cid = await mintingpress.methods.getCid(this.props.id).call();
    const jsonUrl = (`https://ipfs.io/ipfs/${cid}`);
console.log(acc[0]);

    if (_price > 0) {
      const _eth = web3.utils.fromWei(_price, 'ether') * 1;
      this.setState({
        account: acc[0],
        price: (`${_eth.toFixed(5)} ether`),
        royalty: (` (includes ${royalty} % royalty)`),
        buyDisabled: false
      });
    } else {
      this.setState({
        price: 'Not for sale',
        royalty: '',
        buyDisabled: true
      });
    }

    await axios.get(jsonUrl)
      .then(res => {
        const metadata = res.data;
        this.setState({ metadata });
      })
    this.setState({
      tokenOwner: tokenOwner,
      salePrice: _price
    });
  }


    onBuySubmit = async event => {
      event.preventDefault();

      this.setState({
        loading: true,
        errorMessage: '',
        successMessage: ''
      });
      const press = this.props.press;
      console.log(this.state.account);
      console.log(this.state.salePrice);
      try {
        await press.methods.buyToken(this.props.id).send({
          from: this.state.account,
          value: this.state.salePrice
          })
      } catch (err) {
        this.setState({ errorMessage: err.message });
      }

      this.setState({ loading: false });
      if (this.state.errorMessage == '') {
        const _newlyBought = await press.methods.getTitle(this.props.id).call();
        this.setState({ successMessage: `Congratulations! You are now the owner of ${_newlyBought}`});
      }
    }

  render() {
    const _header = this.state.metadata.id + ' - ' +  this.state.metadata.name;

    return (
      <Card>
      <a href={this.state.metadata.external_url}>
        <Image
          src={this.state.metadata.external_url}
          size='medium'

        />
      </a>
        <Card.Content>
          <Card.Header>{_header}</Card.Header>
          <Card.Meta>{this.state.metadata.description}</Card.Meta>
          <Card.Description>
          {this.state.price}<br />{this.state.royalty}<br />{this.state.tokenOwner}
          </Card.Description>
        </Card.Content>
        <Card.Content extra>
          <Button
            loading={this.state.loading}
            type="submit"
            floated="right"
            onClick={this.onBuySubmit}
            disabled={this.state.buyDisabled}
            content="Buy NFT"
          />
        </Card.Content>
      </Card>
    );
  }
}

export default ListTokens;

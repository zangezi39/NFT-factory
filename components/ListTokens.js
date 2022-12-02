import React, { Component } from 'react';
import { Grid, Image, Segment } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Web3 from 'web3';
import axios from 'axios';

class ListTokens extends Component {
  state = {
    metadata: [],
    asset: '',
    jsonUrl: '',
    price: 'Not for sale',
    royalty: ''
  }

  async componentDidMount() {
    const { id, press } = this.props;
    const mintingpress= this.props.press;
    const _price = await mintingpress.methods.getPrice(this.props.id).call();
    const royalty = await mintingpress.methods.getRoyalties(this.props.id).call();
    const cid = await mintingpress.methods.getCid(this.props.id).call();
    const jsonUrl = (`https://ipfs.io/ipfs/${cid}`);


    if (_price > 0) {
      const _eth = web3.utils.fromWei(_price, 'ether') * 1;
      this.setState({
        price: (`${_eth.toFixed(5)} ether`),
        royalty: (`${royalty} %`)
      });
    }

    await axios.get(jsonUrl)
      .then(res => {
        const metadata = res.data;
        this.setState({ metadata });
      })
  }

  render() {

    return (
      <Segment>
        <Grid columns={5}>
          <Grid.Row>
            <Grid.Column width={1}>{this.state.metadata.id}</Grid.Column>
            <Grid.Column width={2}>{this.state.metadata.name}</Grid.Column>
            <Grid.Column width={3}>
              <Image src={this.state.metadata.external_url} size='small'/>
            </Grid.Column>
            <Grid.Column width={2}>{this.state.price}</Grid.Column>
            <Grid.Column width={2}>{this.state.royalty}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default ListTokens;

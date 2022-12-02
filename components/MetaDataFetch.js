import React, { Component } from 'react';
import IPFS from 'ipfs';
import { Grid, Image, Segment } from 'semantic-ui-react';
import web3 from '../ethereum/web3';
import Web3 from 'web3';

class MetaDataFetch extends Component {
  state = {
    metadata: [],
    isApproved: false,
    tokenOwner: '',
    priceInEth: 'This piece is currently not for sale',
    royalty: ''
  }

  async componentDidMount() {
    this.setState({});
    const { id, press } = this.props;
    const mintingpress= this.props.press;
    const price = await mintingpress.methods.getPrice(this.props.id).call();
    const tokenOwner = await mintingpress.methods.ownerOf(this.props.id).call();
    const tokenApproved = await mintingpress.methods.getApproved(this.props.id).call();
    const royalty = await mintingpress.methods.getRoyalties(this.props.id).call();
    const cid = await mintingpress.methods.getCid(this.props.id).call();
    const jsonUrl = (`/ipfs/${cid}`);

    const nodeJ = await IPFS.create();
    const streamJ = nodeJ.cat(jsonUrl)
    let dataJ ='';
    for await (const chunk of streamJ) {
      dataJ += chunk.toString();
    }

    if (tokenApproved != '0x0000000000000000000000000000000000000000') {
      this.setState({ approvedAddress: tokenApproved });
    } else {
      this.setState({ approvedAddress: 'None' });
    }

    if (price > 0) {
      const priceInEth = web3.utils.fromWei(price, 'ether') * 1;
      const priceFixed = priceInEth.toFixed(5);
      this.setState({
        royalty: (`${royalty} %`),
        priceInEth: priceFixed
      });
    }

    this.setState({
      tokenOwner: tokenOwner,
      metadata: JSON.parse(dataJ)
    });

    //Stops the IPFS node to release the file lock
    nodeJ.stop().catch(err => console.log(err));
  }


  render() {
    return (
      <Segment>
        <Grid columns={2}>
          <Grid.Row>
            <Grid.Column width={3}><h4>ID:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.id}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Title:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.name}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Description:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.description}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Author:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.author}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>IPFS URL:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.image}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>HTML URL:</h4></Grid.Column>
            <Grid.Column>{this.state.metadata.external_url}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Thumbnail:</h4></Grid.Column>
            <Grid.Column>
              <Image src={this.state.metadata.external_url} size='medium'/>
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Price (in ether):</h4></Grid.Column>
            <Grid.Column>{this.state.priceInEth}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Creator's sales commission:</h4></Grid.Column>
            <Grid.Column>{this.state.royalty}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Owner:</h4></Grid.Column>
            <Grid.Column>{this.state.tokenOwner}</Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column width={3}><h4>Approved to manage token:</h4></Grid.Column>
            <Grid.Column>{this.state.approvedAddress}</Grid.Column>
          </Grid.Row>
        </Grid>
      </Segment>
    );
  }
}

export default MetaDataFetch;

import React, { Component } from 'react';
import IPFS from 'ipfs';
import {
  Button,
  Container,
  Form,
  Grid,
  Image,
  Message,
  Segment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../../../ethereum/web3';
import Web3 from 'web3';
import Link from 'next/link';
import nftfactory from '../../../ethereum/nftfactory';
import MintingPress from '../../../ethereum/mintingpress';

export async function getServerSideProps(context) {
  const id = context.query.token;
  const path = context.query.mint;
  return { props: { id, path } };
}

class TokenDataFetch extends Component {
  state = {
    metadata: [],
    setupReq: '',
    isApproved: false,
    tokenOwner: '',
    pName: '',
    pSymbol: '',
    priceInEth: 'This piece is currently not for sale',
    royalty: ''
  }

  async componentDidMount() {
    this.setState({});
    const address = await nftfactory.methods
      .getContractAddress(this.props.path).call();
    const press =  await MintingPress(address);
    const acc = await web3.eth.getAccounts();
    const _price = await press.methods.getPrice(this.props.id).call();
    const pName = await press.methods.pName().call();
    const pSymbol = await press.methods.pSymbol().call();
    const tokenOwner = await press.methods.ownerOf(this.props.id).call();
    const tokenApproved = await press.methods.getApproved(this.props.id).call();
    const royalty = await press.methods.getRoyalties(this.props.id).call();
    const cid = await press.methods.getCid(this.props.id).call();
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

    if (_price > 0) {
      const _eth = web3.utils.fromWei(_price, 'ether') * 1;
      this.setState({
        account: acc[0],
        royalty: (`${royalty} %`),
        priceInEth: (`${_eth.toFixed(5)}`),
        buyDisabled: false
      });
    } else {
      this.setState({ buyDisabled: true })
    }

    this.setState({
      tokenOwner: tokenOwner,
      metadata: JSON.parse(dataJ),
      salePrice: _price,
      pName: pName,
      pSymbol: pSymbol,
      press: press
    });

    //Stops the IPFS node to release the file lock
    nodeJ.stop().catch(err => console.log(err));
  }

  onBuySubmit = async event => {
    event.preventDefault();
    this.setState({
      loading: true,
      errorMessage: '',
      successMessage: ''
    });
    const press = this.state.press;
    console.log(this.props.id, this.state.account, this.state.salePrice)
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
    return (
      <Container>
        <br />
        <label><h1>&nbsp;&nbsp;&nbsp;{this.state.pName} &nbsp;({this.state.pSymbol})</h1></label>
        <br />
        <label><h2>&nbsp;&nbsp;&nbsp; token information:</h2></label>
        <br />
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
              <Grid.Column>
                <a href={this.state.metadata.external_url}>
                  {this.state.metadata.external_url}
                </a>
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}><h4>Thumbnail:</h4></Grid.Column>
              <Grid.Column>
                <Image
                  href={this.state.metadata.external_url}
                  src={this.state.metadata.external_url}
                  size='medium'
                />
              </Grid.Column>
            </Grid.Row>
            <Grid.Row>
              <Grid.Column width={3}><h4>Price (in MATIC):</h4></Grid.Column>
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
            <Grid.Row>
              <Grid.Column width={3}></Grid.Column>
              <Grid.Column>
                <Form error={!!this.state.errorMessage} success={!!this.state.successMessage}>
                  <Form.Field>
                    <Button
                      loading={this.state.loading}
                      type="submit"
                      floated="center"
                      onClick={this.onBuySubmit}
                      disabled={this.state.buyDisabled}
                      content="Buy this token"
                    />
                    <br /><br />
                    <u>NOTE:</u> &nbsp; To buy a {this.state.pSymbol} token please make sure that you
                    have a MetaMask wallet set up on Polygon network and there are sufficient amount
                    of MATIC tokens. Please read the <a href="/help" target="blank"> setup instructions </a>
                    if you ave not yet done it.
                  </Form.Field>
                  <br />
                  <Message error header="Ooops!" content={this.state.errorMessage} />
                  <Message success header="Sucess!!!" content={this.state.successMessage} />
                  <br />
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </Container>
    );
  }
}

export default TokenDataFetch;

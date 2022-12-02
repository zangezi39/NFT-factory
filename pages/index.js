import React, { Component } from 'react';
import axios from 'axios';
import {
  Container,
  Dropdown,
  Form,
  Button,
  Input,
  Menu,
  Message,
  Grid,
  Segment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import nftfactory from '../ethereum/nftfactory';
import Web3 from 'web3';
import MintingPressApp from './[mint]/index';
import FactoryHeader from '../components/FactoryHeader';
import Router from 'next/router';

export async function getServerSideProps() {
  const creator = await nftfactory.methods.factoryCreator().call();
  const symbols = await nftfactory.methods.getSymbols().call();
  return { props: { creator, symbols }};
}

class NftFactoryApp extends Component {

  state = {
    nameM: '',
    symbM: '',
    descM: '',
    authM: '',
    tokeM: 1,
    address: '',
    ipfsApi: '',
    loading: false,
    successMessage: '',
    errorMessage: '',
    pathName: ''
  };

  onMintingPressSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading: true,
      errorMessage: ''
    });
    const accounts = await web3.eth.getAccounts();
    const {
      nameM,
      symbM,
      descM,
      authM,
      tokeM,
      ipfsApi
    } = this.state;

    if (
      this.state.ipfsApi != '' &&
      this.state.nameM != '' &&
      this.state.symbM != '' &&
      this.state.descM != '' &&
      this.state.authM != ''
    ) {
      if (this.state.symbM.length > 2) {
        if (this.props.symbols.indexOf(this.state.symbM) < 0) {
          try {
            const _newPath = this.state.nameM.replace(/\s+/g, '-');
            const mintingPress = await nftfactory.methods.createMintingPress(
              this.state.ipfsApi,
              this.state.nameM,
              this.state.symbM.toUpperCase(),
              this.state.descM,
              this.state.tokeM,
              this.state.authM,
              _newPath
            ).send({ from: accounts[0] });
            this.setState({
              address: mintingPress.contractAddress,
              errorMessage: '',
              successMessage: 'In just a second you will be redirected to your Minting Press administration page',
            });
            Router.push({
              pathname: "/[mint]",
              query: {
                mint: _newPath
              }
            });
          } catch (err) {
            this.setState({ errorMessage: err.message });
          }
        } else {
          this.setState({ errorMessage: 'Symbol already exists - pick another one'});
        }
      } else {
        this.setState({ errorMessage: 'Symbol must be minimum three letters'});
      }
    } else {
      this.setState({ errorMessage: 'All fields must be completed'});
    }
    this.setState({ loading: false });
  }

  render() {
    return (
      <div>
        <FactoryHeader />
        <Container>
          <label><h1>Create your own NFT Minting Press</h1></label>
          <h4>Your Minting Press will be deployed on Polygon, a decentralized network built on top of the Ethereum Virtual Machine (EVM)
          which combines the security and integrity of the Ethereum blockchain with faster transaction speeds at a tiniest fraction of the cost.
          Digital assets are stored on the amazing Interplanetary File System (IPFS) with its unsurpassed accessibility and persistence.</h4>
          <label><h4>Before you proceed, read the <a href="/help" target="blank"> HELP page </a> and make sure to complete all the setup instructions.</h4></label>
          <h4>All fields are required. Please give the information you enter some careful thought - once set and deployed,
          it will not be possible to change it later. When you are sure that everything entered is exactly what you want, the
          way you wanted, press the green Deploy button, approve the transaction when prompted by Metamask and wait a few seconds.
          <br /><br />
          Once your Minting Press is successfully deployed, you will be automatically taken to your dashboard, where you can </h4>
          <label><h3>MINT YOUR FIRST NFT!</h3></label>
          <h4>* In the future you and other token owners, approved managers and operators can access the dashboard directly, or by selecting
          your NFT symbol from the searchable dropdown in the upper left corner and clicking the Go to Dashboard button next to it. Please make
          sure to log in to your MetaMask wallet, set the network to Polygon Mainnet and select the account associated with your Minting Press. </h4>
          <br />
          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <Segment>
                  <Form
                    error={!!this.state.errorMessage}
                    success={!!this.state.successMessage}
                  >
                    <Form.Field>
                      <label>Let's start by pasting your unique NFT Storage API key:</label>
                      <Input
                        value={this.state.ipfsApi}
                        onChange={event => this.setState({ ipfsApi: event.target.value })}
                      />
                    <br /><br />
                      <label>Now let's give your minting press a name. Make it
                      imaginative and catchy, this is how your NFTs will be known:</label>
                      <Input
                        value={this.state.nameM}
                        onChange={event => this.setState({ nameM: event.target.value })}
                      />
                      <br /><br />
                      <label>Pick a unique 3-5 character symbol (letters or letters/numbers):</label>
                      <Input
                        value={this.state.symbM}
                        onChange={event => this.setState({ symbM: event.target.value })}
                        maxLength="5"
                      />
                      <br /><br />
                      <label>Describe in one sentence what you plan to mint:</label>
                      <Input
                        value={this.state.descM}
                        onChange={event => this.setState({ descM: event.target.value })}
                      />
                      <br /><br />
                      <label>How do you wish to be referred to? You may give your real
                      name or a nom-de-plume - your choice:</label>
                      <Input
                        value={this.state.authM}
                        onChange={event => this.setState({ authM: event.target.value })}
                      />
                      <br /><br />
                      <label>Set the first token number (default is 1):</label>
                      <Input
                        value={this.state.tokeM}
                        onChange={event => this.setState({ tokeM: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading}
                        type="submit"
                        floated="right"
                        color="green"
                        onClick={this.onMintingPressSubmit}
                      >Deploy your NFT Minting Press
                      </Button>
                    </Form.Field>
                    <br /><br />
                    <Message error header="Oops!" content={this.state.errorMessage} />
                    <Message success>
                      <Message.Header>
                      Congratulations! {this.state.nameM} NFT Minting Machine has been
                      successfully deployed on Polygon network.
                      </Message.Header>

                      <p>{this.state.successMessage}</p>
                    </Message>
                    <br />
                  </Form>
                  <br /><br />
                </Segment>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </div>
    )
  }

}

export default NftFactoryApp;

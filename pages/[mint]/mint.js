import React, { Component } from 'react';
import {
  Container,
  Form,
  Button,
  Input,
  Message,
  Grid
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../../ethereum/web3';
import Web3 from 'web3';
import Router from 'next/router';
import nftfactory from '../../ethereum/nftfactory';
import MintingPress from '../../ethereum/mintingpress';
import PressHeader from '../../components/PressHeader';
import IPFS from 'ipfs';
import { NFTStorage, File, Blob } from "nft.storage";

export async function getServerSideProps(context) {
  const path = context.query.mint;
  return { props: { path } };
}

class Mint extends Component {

  state = {
    account: '',
    address: '',
    author: '',
    id: 'mint',
    press: '',
    tokenDescription: '',
    tokenTitle: '',
    admin: ''
  }

  async componentDidMount() {
    const acc = await web3.eth.getAccounts();
    const address = await nftfactory.methods
      .getContractAddress(this.props.path).call();
    const press =  await MintingPress(address);
    const author = await press.methods.author().call();
    const admin = await press.methods.admin().call();
    if (acc[0] != admin) {
      Router.push('/AccessDenied')
    }

    this.setState({
      account: acc[0],
      address: address,
      author: author,
      admin: admin,
      press: press
    });
  }

  //Uploads the NFT asset
  onUploadSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading0: true,
      cidToken: '',
      errorMessage0: '',
      successMessage0: '',
      successMessage1: ''
    });
    const uploadFiles = document.getElementById("fileItem").files;
    if (uploadFiles.length > 0) {
      //Checks if sender is admin
      if (this.state.account == this.state.admin) {
        try {
          const press = this.state.press;
          const storageApi = await press.methods.getApi(this.state.account).call();
          const client = new NFTStorage({ token: storageApi });
          const fileName = uploadFiles[0].name;
          const assetcid = await client.storeBlob(uploadFiles[0]);
          this.setState({
            tokenUrl: (`https://ipfs.io/ipfs/${assetcid}`),
            tokenIpfs: (`ipfs://${assetcid}`),
            cidToken: assetcid,
            fileName: fileName
          });
        } catch (err) {
          this.setState({ errorMessage0: err.message });
        }
      } else {
        this.setState({ errorMessage0: 'Admin only' });
      }
    } else {
      this.setState({ errorMessage0: 'Please select a file to upload' });
    }
    if ( this.state.errorMessage0 == '' && this.state.fileName != '') {
      this.setState({
        successMessage0: 'Now fill in the title and description below'
      });
    }
    this.setState({ loading0: false });
  }


  //**Mints a new token
  onMintSubmit = async event => {
    event.preventDefault();
    this.setState({
      successMessage0: '',
      successMessage1: '',
      loading1: true,
      errorMessage1: ''
    });
    if (this.state.account == this.state.admin) {
      const press =  this.state.press;
      const storageApi = await press.methods.getApi(this.state.account).call();
      const client = new NFTStorage({ token: storageApi });
      const _tokenId = await press.methods.tokenId().call();
      const _uploaded = await press.methods.existsCid(this.state.cidToken).call();
      const { tokenTitle, tokenDescription } = this.state;
      //Checks if the asset file was uploaded to IPFS
      if (this.state.cidToken !== '') {
        //Checks if the token is not being minted more than once
        if (_uploaded == false) {
          const metaData = JSON.stringify({
            id: _tokenId,
            name: this.state.tokenTitle,
            description: this.state.tokenDescription,
            image: this.state.tokenIpfs,
            external_url: this.state.tokenUrl,
            author: this.state.author,
            filename: this.state.fileName,
          });
          const metacid = await client.storeBlob(metaData);
          const metaUrl = (`https://ipfs.io/ipfs/${metacid}`);
          this.setState({
            cidMeta: metacid,
            metaUrl: metaUrl
           });
          try {
            await press.methods.mint(metacid, this.state.cidToken, this.state.tokenTitle).send({ from: this.state.account });
            this.setState({
              successMessage1: 'Please reload the page'
            });
          } catch (err) {
            this.setState({ errorMessage1: err.message });
            await client.delete(this.state.cidMeta);
            await client.delete(this.state.cidToken);
          }
        } else {
          this.setState({ errorMessage1: 'You are trying to mint existing token'})
        }
      } else {
        this.setState({ errorMessage1: 'You must upload file first' })
      }
    } else {
      this.setState({
        errorMessage1: 'Admin or approved operator only'
      });
    }
    this.setState({
      loading1: false
    });
  }

  render() {
    return (
      <div>
        <PressHeader
          path={this.props.path}
          id={this.state.id}
          acct={this.state.account}
        >
        <Container>
          <Grid>
            <Grid.Row>
              <Grid.Column width={16}>
                <br />
                <label><h1>mint:</h1></label>
                <br /><br />
                <Form
                  error={!!this.state.errorMessage0}
                  success={!!this.state.successMessage0}
                >
                  <Form.Field>
                    <label>Select a file and click the Upload button:</label>
                    <input
                      type="file"
                      id="fileItem"
                      style={{ display: "hidden" }}
                    />
                    <br /><br />
                    <Button
                      loading={this.state.loading0}
                      type="submit"
                      floated="right"
                      content="Upload"
                      onClick={this.onUploadSubmit}
                    />
                    <br /><br />
                  </Form.Field>
                  <Message error header="Oops!" content={this.state.errorMessage0} />
                  <Message success>
                    <Message.Header>
                      {this.state.fileName} has been uploaded to the Interplanetary
                      File System, where it shall reside forever and ever!<br />
                    </Message.Header>
                    <p>{this.state.successMessage0}</p>
                  </Message>
                </Form>
                <br />
                <Form
                  error={!!this.state.errorMessage1}
                  success={!!this.state.successMessage1}
                >
                  <Form.Field>
                    <label>Enter title and brief description:  </label>
                    <Input
                      placeholder="Enter title"
                      value={this.state.tokenTitle}
                      onChange={event => this.setState({ tokenTitle: event.target.value })}
                    />
                    <br /><br />
                    <Input
                      placeholder="Enter description"
                      value={this.state.tokenDescription}
                      onChange={event => this.setState({ tokenDescription: event.target.value })}
                    />
                    <br /><br />
                    <Button
                      loading={this.state.loading1}
                      type="submit"
                      floated="right"
                      color="green"
                      onClick={this.onMintSubmit}
                    >Mint Token
                    </Button>
                  </Form.Field>
                  <br />
                  <Message error header="Oops!" content={this.state.errorMessage1} />
                  <Message success>
                    <Message.Header>
                      Cool! Your token has been successfully minted!<br />
                      You can view token metadata at {this.state.metaUrl}
                    </Message.Header>
                    <br />
                    <p>{this.state.successMessage1}</p>
                  </Message>
                  <br />
                </Form>
              </Grid.Column>
            </Grid.Row>
          </Grid>
          </Container>
        </PressHeader>
      </div>
    )
  }
}

export default Mint;

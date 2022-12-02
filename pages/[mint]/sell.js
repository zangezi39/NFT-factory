import React, { Component } from 'react';
import {
  Container,
  Dropdown,
  Form,
  Button,
  Input,
  Message,
  Grid,
  Segment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../../ethereum/web3';
import Web3 from 'web3';
import Router from 'next/router';
import nftfactory from '../../ethereum/nftfactory';
import MintingPress from '../../ethereum/mintingpress';
import PressHeader from '../../components/PressHeader';
import { returnTokenChoices } from '../../components/scripts';

export async function getServerSideProps(context) {
  const path = context.query.mint;
  return { props: { path } };
}

class Sell extends Component {

  state = {
    account: '',
    admin: '',
    id: 'sell',
    ownerId: '',
    operator: '',
    press: '',
    royalty: '',
    tokenList: [],
    tokenChoices: [],
    tokenPrice: ''
  }

  async componentDidMount() {
    const acc = await web3.eth.getAccounts();
    const address = await nftfactory.methods
      .getContractAddress(this.props.path).call();
    const press =  await MintingPress(address);
    const access1 = await press.methods.getAccess(acc[0], 1).call();
    const access2 = await press.methods.getAccess(acc[0], 2).call();
    const access3 = await press.methods.getAccess(acc[0], 3).call();
    if (
      access1 == true ||
      access2 == true ||
      access3 == true
    ) {
      const admin = await press.methods.admin().call();
      const operator = await press.methods.getOperator(admin).call();
      //Generates list of tokens for the dropdown
      const _totalOwned = await press.methods.balanceOf(admin).call();
      this.setState({
        account: acc[0],
        admin: admin,
        press: press,
        tokenChoices: await returnTokenChoices(press)
      })
    } else {
      Router.push('/AccessDenied')
    }
  }



  onPriceSubmit = async event =>{
    event.preventDefault();
    const { priceId, tokenPrice } = this.state;
    const press = this.state.press;
    const _ownerId = await press.methods.ownerOf(this.state.priceId).call();
    const _tokenList = await press.methods.getTokenList().call();
    const _operator = await press.methods.getOperator(_ownerId).call();
    const _approveAddress = await press.methods.getApproved(this.state.priceId).call();
    this.setState({
      loading4: true,
      errorMessage4: '',
      successMessage4: ''
    })
    if (_tokenList.indexOf(this.state.priceId) >= 0) {
      if (
        this.state.account == _ownerId ||
        this.state.account == _operator ||
        this.state.account == _approveAddress
      ) {
        if (this.state.tokenPrice != '') {
          const priceInWei = web3.utils.toWei(this.state.tokenPrice, 'ether');
          try {
            await press.methods
              .setPrice(this.state.priceId, priceInWei)
              .send({ from: this.state.account });
          } catch (err) {
            this.setState({
              errorMessage4: err.message
            });
          }
        } else {
          this.setState({
            errorMessage4: 'Enter valid price (or 0 to de-list)'
          });
        }
      } else {
        this.setState({
          errorMessage4: 'You are not authorized'
        });
      }
    } else {
      this.setState({
        errorMessage4: 'Invalid token ID'
      });
    }

    if (this.state.errorMessage4 == '') {
      if (this.state.tokenPrice == 0) {
        this.setState({
          successMessage4: "The token has been de-listed"
        });
      } else {
        this.setState({
          successMessage4: "The token is now ready for sale"
        });
      }
    }
    this.setState({ loading4: false });
  }


  onRoyaltiesSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading11: true,
      errorMessage11: '',
      successMessage11: ''
    });
    const press = this.state.press;
    const { royaltyId, royalty } = this.state;
    const author = await press.methods.author().call();
    const _price = await press.methods.getPrice(this.state.royaltyId).call();
    const _owner = await press.methods.ownerOf(this.state.royaltyId).call();
    if (this.state.admin == _owner && this.state.account == _owner) {
      try {
        await press.methods
          .setRoyalties(this.state.royaltyId, this.state.royalty)
          .send({ from: this.state.account });
        this.setState({
          successMessage11: (`Royalty has been set at ${this.state.royalty} %`),
          errormessage11: ''
        });
      } catch (err) {
        this.setState({
          errorMessage11: err.message,
          successMessage11: ''
        });
      }
    } else {
      this.setState({ errorMessage11: `Royalty may be set only by ${author} and only before the initial sale` });
    }
    this.setState({ loading11: false });
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
                  <label><h1>sell:</h1></label>
                  <br /><br />
                  <label><h3>Set price and allow selling</h3></label>
                  <br />
                  <Form
                    error={!!this.state.errorMessage4}
                    success={!!this.state.successMessage4}
                  >
                    <Form.Field>
                      <Dropdown
                        placeholder="&nbsp;Select token...&nbsp;"
                        selection
                        search
                        options={this.state.tokenChoices}
                        onChange={(event, data) => {this.setState({ priceId: data.value.toString() })}}
                      />
                      <br /><br />
                      <label>Enter price in MATIC (0 to de-list from sale):</label>
                      <Input
                        type="number"
                        id="price"
                        value={this.state.tokenPrice}
                        min="0.000"
                        step="0.001"
                        precision={2}
                        onChange={event => this.setState({ tokenPrice: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading4}
                        type="submit"
                        floated="right"
                        onClick={this.onPriceSubmit}
                      >Submit</Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage4} />
                    <Message success header="Sucess!!!" content={this.state.successMessage4} />
                    <br />
                  </Form>
                  <br /><br />
                  <label><h3>Set the secondary sales royalty:</h3></label>

                  <label>Percentage of the sale price you wish to receive
                  each time your NFT resells. This is a way for the creator to continue
                  receiving a share of the future sales. There is some controversy regarding
                  secondary royalties, with some opposing on the grounds that they distort
                  the market. We let you decide if it is something that will work for you.
                  If you do choose to implement the secondary sales royatlies, keep in mind
                  that setting royalties too high may negatively affect future sales. We
                  recommend setting secondary sales royatlies no higher than 10% (n fact,
                  some marketplaces, such as OpenSea, do not allow setting them higher than
                  10% at all).</label>
                  <br /><br />
                  <Form
                    error={!!this.state.errorMessage11}
                    success={!!this.state.successMessage11}
                  >
                    <Form.Field>
                    <Dropdown
                      placeholder="&nbsp;Select token...&nbsp;"
                      selection
                      search
                      options={this.state.tokenChoices}
                      onChange={(event, data) => {this.setState({ royaltyId: data.value.toString() })}}
                    />
                      <br /><br />
                      <Input
                        label={{ basic: true, content: '%'}}
                        id="royalty"
                        labelPosition='right'
                        placeholder='Enter royalty'
                        value={this.state.royalty}
                        onChange={event => this.setState({ royalty: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading11}
                        type="submit"
                        floated="right"
                        onClick={this.onRoyaltiesSubmit}
                      >Set royalty</Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage11} />
                    <Message success header="Sucess!!!" content={this.state.successMessage11} />
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

export default Sell;

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

class Transfer extends Component {

  state = {
    account: '',
    addressFrom: '',
    addressTo: '',
    admin: '',
    id: 'transfer',
    operator: '',
    press: '',
    tokenChoices: [],
    transferId: ''
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

  onTransferSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading9: true,
      errorMessage9: ''
    });
    const press = this.state.press;
    const { transferId, addressFrom, addressTo } = this.state;
    const tokenList = await press.methods.getTokenList().call();

    if (tokenList.indexOf(this.state.transferId) >= 0) {
      const _ownerId = await press.methods
        .ownerOf(this.state.transferId).call();
      const _operator = await press.methods
        .getOperator(_ownerId).call();
      const _approved = await press.methods
        .getApproved(this.state.transferId).call();

      if (
        this.state.account == _ownerId ||
        this.state.account == _operator ||
        this.state.account == _approved
      ) {
        if (this.state.addressTo != _ownerId) {
          let _from;
          if (this.state.addressFrom == '') {
            _from = _ownerId;
          } else {
            _from = this.state.addressFrom;
          }
          try {
            await press.methods.safeTransferFrom(
              _from,
              this.state.addressTo,
              this.state.transferId
            ).send({ from: this.state.account });
          } catch (err) {
            this.setState({ errorMessage9: err.message });
          }
        } else {
          this.setState({ errorMessage9: 'Invalid transfer'})
        }
      } else {
        this.setState({ errorMessage9: 'Not authorized'})
      }
    } else {
      this.setState({ errorMessage9: 'Non-existing token' })
    }
    this.setState({ loading9: false });
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
                  <label><h1>transfer:</h1></label>
                  <br /><br />
                  <label><h4>Select token to transfer, enter sender and recipient addresses</h4></label>
                  <br />
                  <Form error={!!this.state.errorMessage9}>
                    <Form.Field>
                      <Dropdown
                        placeholder="&nbsp;Select token...&nbsp;"
                        selection
                        search
                        options={this.state.tokenChoices}
                        onChange={(event, data) => {this.setState({ transferId: data.value.toString() })}}
                      />
                      <br /><br />
                      <Input
                        placeholder='Sender address'
                        value={this.state.addressFrom}
                        onChange={event => this.setState({ addressFrom: event.target.value })}
                      />
                      <br /><br />
                      <Input
                        placeholder='Recipient address'
                        value={this.state.addressTo}
                        onChange={event => this.setState({ addressTo: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading9}
                        type="submit"
                        floated="right"
                        onClick={this.onTransferSubmit}
                      >Submit
                      </Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage9} />
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

export default Transfer;

import React, { Component } from 'react';
import {
  Container,
  Dropdown,
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
import { returnOperator, returnTokenChoices } from '../../components/scripts';

export async function getServerSideProps(context) {
  const path = context.query.mint;
  return { props: { path } };
}

// export async function getStaticPaths(context) {
//   return {
//     fallback: "blocking"
//   };
// }
//
// export async function getStaticProps(context) {
//   const path = context.query.mint;
//   return {
//     props: { path }
//   }
// }

class Approve extends Component {

  state = {
    account: '',
    approvedAddress: '',
    approvedOperator: '',
    approveAddress: '',
    approveAddressC: '',
    approveToken: '',
    approveTokenC: '',
    approveAllAddress: '',
    id: 'approve',
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
    if (
      access1 == true ||
      access2 == true
    ) {
      const operator = await press.methods.getOperator(acc[0]).call();
      this.setState({
        account: acc[0],
        operator: operator,
        press: press,
        tokenChoices: await returnTokenChoices(press)
      })
    } else {
      Router.push('/AccessDenied')
    }
  }

  //**Approves a "spender" for a specified token
  onApproveSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading1: true,
      errorMessage1: ''
    });
    const press = this.state.press;
    const { approveToken, approveAddress } = this.state;
    const tokenList = await press.methods.getTokenList().call();

    if (tokenList.indexOf(this.state.approveToken) >= 0) {
      const _ownerId = await press.methods.ownerOf(this.state.approveToken).call();
      const _operator = await press.methods.getOperator(_ownerId).call();
      if (web3.utils.isAddress(this.state.approveAddress) == true) {
        if (
          (this.state.account == _ownerId ||
          this.state.account == _operator) &&
          this.state.approveAddress != _ownerId &&
          this.state.approveAddress != _operator &&
          this.state.approveAddress != this.state.account
        ) {
          try {
            await press.methods.approve(
              this.state.approveAddress,
              this.state.approveToken
            ).send({ from: this.state.account });
          } catch (err) {
            this.setState({ errorMessage1: err.message });
          }
        } else {
          this.setState({ errorMessage1: 'Not authorized'});
        }
      } else {
        this.setState({ errorMessage1: 'Invalid address'});
      }
    } else {
      this.setState({ errorMessage1: 'Token does not exist'});
    }
    this.setState({ loading1: false });
  }


  onApproveCancel = async event => {
    event.preventDefault();
    this.setState({
      loading2: true,
      errorMessage2: ''
    });
    const press = this.state.press;
    const { approveTokenC, approveAddressC } = this.state;
    const _ownerId = await press.methods.ownerOf(this.state.approveTokenC).call();
    const _operator = await press.methods.getOperator(_ownerId).call();
    const isApproved = await press.methods
      .getApproved(this.state.approveTokenC).call();
    const _tokenList = await press.methods.getTokenList().call();

    if (_tokenList.indexOf(this.state.approveTokenC) >= 0) {
      if (this.state.account == _ownerId || this.state.account == _operator) {
        if (web3.utils.isAddress(this.state.approveAddressC) ==  true) {
          if ( this.state.approveAddressC == isApproved ) {
            try {
              await press.methods.approve(
                this.state.approveAddressC,
                this.state.approveTokenC
              ).send({ from: this.state.account });
            } catch (err) {
              this.setState({ errorMessage2: err.message });
            }
          } else {
              this.setState({ errorMessage2: 'The address has not been approved to manage this token'});
          }
        } else {
          this.setState({ errorMessage2: 'Invalid address'})
        }
      } else {
        this.setState({ errorMessage2: 'Token owner or approved operator only'})
      }
    } else {
      this.setState({ errorMessage2: 'Token does not exist'});
    }
    this.setState({ loading2: false });
  }


  onApproveAllSubmit = async event => {
    event.preventDefault();
    this.setState({
      loading3: true,
      errorMessage3: '',
      errorMessage4: ''
    });
    const press = this.state.press;
    const _bal = await press.methods.balanceOf(this.state.account).call();
    const { approveAllAddress } = this.state;

    if (_bal > 0) {
      if (this.state.operator == '0x0000000000000000000000000000000000000000') {
        if (web3.utils.isAddress(this.state.approveAllAddress) == true) {
          try {
            await press.methods
              .setApprovalForAll(this.state.approveAllAddress, true)
              .send({ from: this.state.account });
            this.setState({ operator: this.state.approveAllAddress });
          } catch (err) {
            this.setState({ errorMessage3: err.message });
          }
        } else {
          this.setState({ errorMessage3: 'Please enter a valid address' });
        }
      } else {
        this.setState({ errorMessage3: 'Operator already assigned' });
      }
    } else {
      this.setState({ errorMessage3: 'You do not own any tokens' });
    }
    this.setState({ loading3: false })
  }


  onCancelApproveAll = async event => {
    event.preventDefault();
    this.setState({
      loading4: true,
      errorMessage4: ''
    });
    const press = this.state.press;
    const isOperator = await press.methods.getOperator(this.state.account).call();
    if (isOperator != '0x0000000000000000000000000000000000000000') {
      try {
        await press.methods
          .setApprovalForAll(isOperator, false)
          .send({ from: this.state.account });
      } catch (err) {
        this.setState({ errorMessage4: err.message });
      }
    } else {
      this.setState({ errorMessage4: 'No operator is currently assigned' });
    }
    this.setState({ loading4: false })
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
                  <label><h1>approve:</h1></label>
                  <br /><br />
                  <label><h3>Assign a manager for individual token:</h3></label>
                  <label><h4>(own tokens only - leave address blank to cancel existing approval)</h4></label>
                  <br />
                  <Form error={!!this.state.errorMessage1}>
                    <Form.Field>
                    <Dropdown
                      placeholder="&nbsp;Select token...&nbsp;"
                      selection
                      search
                      options={this.state.tokenChoices}
                      onChange={(event, data) => {this.setState({ approveToken: data.value.toString() })}}
                    />
                      <br /><br />
                      <label>Enter token manager address to approve:  </label>
                      <Input
                        value={this.state.approveAddress}
                        onChange={event => this.setState({ approveAddress: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading1}
                        type="submit"
                        floated="right"
                        color="green"
                        onClick={this.onApproveSubmit}
                      >Approve</Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage1} />
                    <br />
                  </Form>
                  <br />
                  <label><h3>Cancel assigned token manager</h3></label>
                  <br />
                  <Form error={!!this.state.errorMessage2}>
                    <Form.Field>
                    <Dropdown
                      placeholder="&nbsp;Select token...&nbsp;"
                      selection
                      search
                      options={this.state.tokenChoices}
                      onChange={(event, data) => {this.setState({ approveTokenC: data.value.toString() })}}
                    />
                    <br /><br />
                    <label>Enter assigned token manager address to cancel: </label>
                    <Input
                      value={this.state.approveAddressC}
                      onChange={event => this.setState({ approveAddressC: event.target.value })}
                    />
                    <br /><br />
                    <Button
                      loading={this.state.loading2}
                      type="submit"
                      floated="right"
                      color="red"
                      onClick={this.onApproveCancel}
                    >Cancel approval</Button>
                  </Form.Field>
                  <br />
                  <Message error header="Ooops!" content={this.state.errorMessage2} />
                  <br />
                </Form>
              </Grid.Column>
            </Grid.Row>

            <Grid.Row>
              <Grid.Column width={16}>
                <label><h3>Assign operator to manage all tokens:</h3></label>
                <label><h4>(own tokens only)</h4></label>
                <br />
                  <Form error={!!this.state.errorMessage3}>
                    <Form.Field>
                      <label>Enter operator's address:  </label>
                      <Input
                        value={this.state.approveAllAddress}
                        onChange={event => this.setState({ approveAllAddress: event.target.value })}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading3}
                        type="submit"
                        floated="right"
                        color="green"
                        onClick={this.onApproveAllSubmit}
                      >Approve
                      </Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage3} />
                  </Form>
                  <h4>Currently assigned operator:</h4>
                  {returnOperator(this.state.operator)}
                  <br /><br />
                  <Form error={!!this.state.errorMessage4}>
                    <Button
                      negative
                      loading={this.state.loading4}
                      type="submit"
                      attached='bottom'
                      onClick={this.onCancelApproveAll}
                      content="CANCEL ASSIGNED OPERATOR"
                    />
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage4} />
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

export default Approve;

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

class Burn extends Component {

  state = {
    account: '',
    admin: '',
    burnId: '',
    id: 'burn',
    operator: '',
    press: '',
    tokenChoices: []
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


  onBurnSubmit = async event => {
    event.preventDefault();

    const press = this.state.press;
    const { burnId } = this.state;
    const _tokenList = await press.methods.getTokenList().call();

    if (_tokenList.indexOf(this.state.burnId) >= 0) {
      const _ownerId = await press.methods.ownerOf(this.state.burnId).call();
      const _operator = await press.methods.getOperator(_ownerId).call();
      const _approved = await press.methods
        .getApproved(this.state.burnId).call();
      if (
        _ownerId != '0x0000000000000000000000000000000000000000' &&
        (
          this.state.account == _ownerId ||
          this.state.account == _operator ||
          this.state.account == _approved
        )
      ) {
        this.setState({
          loading10: true,
          errorMessage10: ''
        });
        const burnCidMeta = await press.methods.getCid(this.state.burnId).call();
        const burnIpfs = (`/ipfs/${burnCidMeta}`);

        const nodeB = await IPFS.create();
        const streamB = nodeB.cat(burnIpfs)
        let dataB ='';
        for await (const chunk of streamB) {
          dataB += chunk.toString();
        }

        const metaBurn = JSON.parse(dataB);
        const burnTokenIpfs = metaBurn.image;
        const burnCIdToken = burnTokenIpfs.slice(7);

        try {
          await press.methods
            .burn(this.state.burnId)
            .send({ from: this.state.account });
        } catch (err) {
          this.setState({ errorMessage10: err.message });
        }

        if (this.state.errorMessage10 == '') {
          await this.props.client.delete(this.state.burnCidMeta);
          await this.props.client.delete(this.state.burnCidToken);
        }

        this.setState({
          loading10: false,
          totalSupply: await press.methods.totalSupply().call()
        });

        //Stops the IPFS node
        nodeB.stop().catch(err => console.log(err));
      } else {
        this.setState({ errorMessage10: 'Not authorized'})
      }
    } else {
      this.setState({ errorMessage10: 'Non-existing token' })
    }
  }


  render() {
    return (
      <div>
        <PressHeader
          path={this.props.path}
          id={this.state.id}
        >
          <Container>
            <Grid>
              <Grid.Row>
                <Grid.Column width={16}>
                  <br />
                  <label><h1>burn:</h1></label>
                  <br /><br />
                  <label><h3>Burn a token:</h3></label>
                  <br />
                  <Form error={!!this.state.errorMessage10}>
                    <Form.Field>
                      <Dropdown
                        placeholder="&nbsp;Select token...&nbsp;"
                        selection
                        search
                        options={this.state.tokenChoices}
                        onChange={(event, data) => {this.setState({ burnId: data.value.toString() })}}
                      />
                      <br /><br />
                      <Button
                        loading={this.state.loading10}
                        type="submit"
                        floated="right"
                        color="red"
                        onClick={this.onBurnSubmit}
                      >Submit
                      </Button>
                    </Form.Field>
                    <br />
                    <Message error header="Oops!" content={this.state.errorMessage10} />
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

export default Burn;

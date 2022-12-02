import React, { Component } from 'react';
import {
  Container,
  Form,
  Button,
  Input,
  Message,
  Grid,
  Segment
} from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../../ethereum/web3';
import nftfactory from '../../ethereum/nftfactory';
import MintingPress from '../../ethereum/mintingpress';
import PressHeader from '../../components/PressHeader';
import Web3 from 'web3';

export async function getServerSideProps(context) {
  const path = context.query.mint;
  return { props: { path } };
}

class Faq extends Component {
  state = {
    account: '',
    id: 'faq'
  }
  async componentDidMount() {
    const acc = await web3.eth.getAccounts();
    this.setState({ account: acc[0] })
  }
  render() {
    return (
      <div>
        <PressHeader
          path={this.props.path}
          id={this.state.id}
          acct={this.state.account}
        >
          <label><h1>FAQ:</h1></label>
          <br />
          <label><h2>&nbsp;&nbsp;&nbsp;&nbsp;Minting Tokens</h2></label>
          <ul>
            <li>
              <b>Q:</b> Which are the acceptable file formats?<br />
              <b>A:</b> JPG, PNG and GIF (including animations)
            </li><br />
            <li>
              <b>Q:</b> How much does it cost to mint a single NFT?<br />
              <b>A:</b> Approximately 0.02 MATIC
            </li><br />
            <li>
              <b>Q:</b> Is there a limit to how many NFTs can be minted?<br />
              <b>A:</b> No
            </li><br />
            <li>
              <b>Q:</b> Is it possible to change metadata once NFT has been minted?<br />
              <b>A:</b> No. If it was, it would defeat the purpose of the blockchain,
                        data immutability being one of its main principles and sources
                        of advantage, so enter your information very carefully!
            </li><br />
            <li>
              <b>Q:</b> Can anything at all be done if I really need to chamge the token metadata?<br />
              <b>A:</b> Yes. You can burn the token (delete it from the blockchain) and mint it again.
            </li><br />
            <li>
              <b>Q:</b> What if I mint the same token more than once?<br />
              <b>A:</b> This is an issue that you have to decide for yourself. In theory, you can mint it as many
              times as you like, since each time the token is minted it will be assigned a different id, but
              keep in mind that doing so will devalue the token.If you really want to go that way, we suggest
              you mint limited series and never exceed the limit.
            </li><br />
          </ul>
          <br />
          <label><h2>&nbsp;&nbsp;&nbsp;&nbsp;Buying Tokens</h2></label>
          <ul>
            <li>
              <b>Q:</b> Which cryptocurrency may be used to buy NFTs?<br />
              <b>A:</b> Currently we only accept the Polygon (MATIC) token, but we are working
                        on adding more tokens in the near future.
            </li><br />
            <li>
              <b>Q:</b> What is the purpose of creator's royalty?<br />
              <b>A:</b> Creator's royalty is a percentage of the sale amount that goes to the original creator.
            </li><br />
            <li>
              <b>Q:</b> Is creator's royalty included in the sale price?<br />
              <b>A:</b> Yes
            </li><br />
          </ul>
          <br />
          <label><h2>&nbsp;&nbsp;&nbsp;&nbsp;Selling Tokens</h2></label>
          <ul>
            <li>
              <b>Q:</b> Can my tokens be listed on OpenSea?<br />
              <b>A:</b> Yes. Simply connect your MetaMask wallet to the OpenSea marketplace platform.
            </li><br />
            <li>
              <b>Q:</b> Can my tokens be listed on Rarible?<br />
              <b>A:</b> No, not yet.
            </li><br />
            <li>
              <b>Q:</b> What price should I set?<br />
              <b>A:</b> Be realistic and decide on the best price point based on a good
                        grasp of the NFT market dynamics
            </li><br />
            <li>
              <b>Q:</b> Who can set royalties?<br />
              <b>A:</b> Only the token creator and only before the first sale.
            </li><br />
            <li>
              <b>Q:</b> Should I set royalties and at what percentage?<br />
              <b>A:</b> Royalties are somewhat controversial: whilst they repreent a
                        great way to provide a continuous support to the token creators,
                        there is some evidence that they may have a negative effect on
                        the token price dynamics. Give this matter some thought. If you
                        do decide to set royalties, we do not recommend you setting them
                        above 10%, as many NFT marketplaces set maximum caps on royalties
                        and setting them too high may exclude you from many popular
                        platforms, including OpenSea.
            </li><br />
          </ul>
          <br />
          <label><h2>&nbsp;&nbsp;&nbsp;&nbsp;Setting Approvals</h2></label>
          <ul>
            <li>
              <b>Q:</b> Who is an approved operator?<br />
              <b>A:</b> An approved operator is assigned by the owner to manage individual
                        an entire collection of given token
            </li><br />
            <li>
              <b>Q:</b> What is an operator allowed to do?<br />
              <b>A:</b> An operator can set prices, put on sale, approve token managers,
                        transfer and burn tokens.
            </li><br />
            <li>
              <b>Q:</b> What is an approved manager?<br />
              <b>A:</b> An approved manager is assigned by the token owner or approved
                        operator to manage individual tokens
            </li><br />
            <li>
              <b>Q:</b> What is a manager allowed to do?<br />
              <b>A:</b> An operator can set the price, put on sale, transfer and burn
                        the token.
            </li><br />
            <li>
              <b>Q:</b> Is it possible to assign more than one operator/manager?<br />
              <b>A:</b> No
            </li><br />
            <li>
              <b>Q:</b> Can the same person be a manager of more than one token, or operator
                        of more than one collection?<br />
              <b>A:</b> Yes
            </li><br />
          </ul>
        </PressHeader>
      </div>
    )
  }
}

export default Faq;

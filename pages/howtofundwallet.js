import React, { Component } from 'react';
import { Container, Image, Grid } from 'semantic-ui-react';
import 'semantic-ui-css/semantic.min.css';
import web3 from '../ethereum/web3';
import Web3 from 'web3';
import FactoryHeader from '../components/FactoryHeader';

class FundWallet extends Component {
  render() {
    return (
      <div>
        <FactoryHeader />
        <Container>
          <label><h1>how to fund your wallet with Polygon/MATIC:</h1></label>
          <br />
          Polygon (Matic) blockchain has all the advantages of being secure, fast and
          inexpensive, providing all the benefits of Ethereum at a very small fraction
          of the cost. The downside is that it takes a few extra steps to set everything
          up (namely to transfer funds to the Polygon network and buy some Matic tokens
          which you will use to pay for the deployment and minting of the NFTs). In any
          case, the most time-consuming part, opening and verifying an exchange account,
          is necessary no matter which network you end up using, and when you compare the
          costs of deploying and minting NFTs (a few cents vs. tens, or even hundreds of
          dollars) you will agree that going through these extra steps is worth it.
          <ol>
            <li value="number">
              Check the list of exchanges where you can buy Matic, the token you will be using
              to pay for creating your NFTs (<a href="https://polygon.technology/matic-token/"
              target="_blank">https://polygon.technology/matic-token/</a>). If you do not yet have
              an account with one of the exchanges listed, you need to create one. If you are new
              to crypto and want the most straightforward way, we suggest using using one of the
              exchanges listed in the Direct Deposits/Withdrawals to Polygon list, like AscendEX
              (<a href="https://ascendex.com" target="_blank">https://ascendex.com</a>). It may
              take up to several days to verify and fully enable the account.
            </li>
            <br />
            <li value="number">
              Buy some Matic tokens using credit card. AscendEX has a US$30 minimum, which should be enough for
              about 100 NFTs at the current Matic token prices (the fees are rather high, - around 10%, so it is
              best to buy smaller amounts only);
            </li>
            <br />
            <li value="number">
              Download and install MetaMask digital wallet browser extension. This is going to be your main wallet
              which you will use to hold the Matic tokens and your minted NFTs. (<a href="https://metamask.io/download"
              target="_blank">https://metamask.io/download</a>)
            </li>
            <br />
            <li value="number">
              Open the browser, configure MetaMask to connect to the Polygon blockchain by selecting Custom RPC at
              the bottom of the netwok selection dropdown:
              <br /><br />
              <Image
                src='https://ipfs.io/ipfs/bafkreiankwiebrhcb5wiazf6f7dc4yxzfkdgqb6amvwbxmnxkziu7xusd4'
                centered
                size="medium"
              />
              <br /><br />
              Enter the following in the corresponding fields and click Save (see below for example):
              <br />
              <Grid celled>
                <Grid.Row>
                  <Grid.Column width={4}>Network Name:</Grid.Column>
                  <Grid.Column width={12}>Polygon</Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={4}>New RPC URL:</Grid.Column>
                  <Grid.Column width={12}>
                    https://polygon-rpc.com <br />
                    https://rpc-mainnet.matic.network <br />
                    https://rpc-mainnet.maticvigil.com <br />
                    https://rpc-mainnet.matic.quiknode.pro
                  </Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={4}>ChainID:</Grid.Column>
                  <Grid.Column width={12}>137</Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={4}>Symbol:</Grid.Column>
                  <Grid.Column width={12}>MATIC</Grid.Column>
                </Grid.Row>
                <Grid.Row>
                  <Grid.Column width={4}>Block Explorer URL:</Grid.Column>
                  <Grid.Column width={12}>https://polygonscan.com/</Grid.Column>
                </Grid.Row>
              </Grid>
              <br /><br />
              <Image
                src='https://ipfs.io/ipfs/bafkreigczhttok4wjwnjffd5bvlccedzauvg3j75j7njrf6qasiif7btqu'
                centered
                size="medium"
              />
              <br /><br />
            </li>
            <li value="number">
              Copy your MetaMask wallet account address to the clipboard by clicking on “Account” at the top of the
              MetaMask window. Paste it as the receiving address in the withdrawal request form on the exchange web
              site and withdraw your Matic tokens to your MetaMask wallet (make sure that Polygon network is selected
              on the exchange’s withdrawal request form). It may take up to 15 minutes for the tokens to show up in
              your MetaMask wallet.
              <br /><br />
              <Image
                src='https://ipfs.io/ipfs/bafkreieo6tiv5bpq6ouqf3cnlenbwl2at44zydxolepwu4dhwtifuhujey'
                centered
                size="medium"
              />
              <br /><br />
            </li>
          </ol>
          You may also buy your Matic tokens on one of the Other Exchanges listed on the Polygon web site, but
          that will require a few additional steps to move your tokens from Ethereum network over to Polygon. In
          this case you will skip Step 5 above and instead follow these instructions: &nbsp;
          <a href="https://medium.com/stakin/bridging-to-matic-network-from-ethereum-chain-a1b59a64a7ce" target="_blank">
          https://medium.com/stakin/bridging-to-matic-network-from-ethereum-chain-a1b59a64a7ce</a>.      Keep in mind
          that not only is this method more complicated, but will most likely also end up costing you more in
          transaction fees.
          <br /><br />
          Another option is to use a centralized exchange, like Binance (for non-US residents) or Coinbase, to buy
          some Tether token (USDT), a so-called “stablecoin” (tied to the value of the US dollar), and use a
          decentralized bridge, like xPollinate (<a href="https://xpollinate.io" target="_blank">https://xpollinate.io</a>),
          to move it to Polygon, then swap it for Matic token on a decentralized exchange, like CremePieSwap (
          <a href="https://swap.cremepieswapfinance.com/#/swap" target="_blank">https://swap.cremepieswapfinance.com/#/swap</a>
          ). This method is the least expensive in terms of transaction costs, but requires some knowledge and experience of
          working with blockchain.
        </Container>
        <br /><br />
      </div>
    )
  }
}

export default FundWallet;

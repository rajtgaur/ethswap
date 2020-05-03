import React, { Component } from 'react'
import Web3 from 'web3'
import RGToken from '../abis/RGToken.json'
import EthSwap from '../abis/EthSwap.json'
import Navbar from './Navbar'
import Main from './Main'
import './App.css'

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3()
    await this.loadBlockchainData()
  }

  async loadBlockchainData() {
    const web3 = window.web3
    let accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })
    
    const networkId = await web3.eth.net.getId()

    // load Token
    const tokenData = RGToken.networks[networkId]
    if(tokenData) {
      const token = new web3.eth.Contract(RGToken.abi, tokenData.address)
      this.setState({ token })
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert(`Token contract is not deployed on the current network. Change the network in Metamask.`)
    }

    // load EthSwap
    const ethSwapData = EthSwap.networks[networkId]
    if(ethSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, ethSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert(`EthSwap contract is not deployed to detected network. Change the network in Metamask.`)
    }

    this.setState({ loading: false })
  }

  async loadWeb3() {
    if(window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    } else if(window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    } else {
      window.alert('Non-ethereum browser detected. You should consider trying Metamask!')
    }
  }

  buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account })
    .on('transactionHash', (hash) => {
      this.setState({ loading: false })
      window.location.reload()
    })
    .on('confirmation', (confirmationNumber, receipt) => {
      if(confirmationNumber.toString() === '3') {
      window.location.reload()
    }
    })
    .on('error', (error) => {
      console.log(error)
      window.alert(`There was an error!`)
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account })
    .on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account })
      .on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
      .on('confirmation', (confirmationNumber, receipt) => {
        if(confirmationNumber.toString() === '3') {
        window.location.reload()
      }
      })
      .on('error', (error) => {
        console.log(error)
        window.alert(`There was an error!`)
      })
    })
  }

  constructor(props) {
    super(props)
    this.state = {
      account: '',
      token: {},
      ethSwap: {},
      ethBalance: '0',
      tokenBalance: '0',
      loading: true
    }
  }

  render() {
    let content
    if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
    } else {
      content = <Main
      ethBalance={this.state.ethBalance}
      tokenBalance={this.state.tokenBalance}
      buyTokens={this.buyTokens}
      sellTokens={this.sellTokens}
      />
    }
    return (
      <div>
        <Navbar account={this.state.account}/>
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '600px' }}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App

import { Tabs, Tab } from 'react-bootstrap'
import dBank from '../abis/dBank.json'
import React, { Component } from 'react';
import Token from '../abis/Token.json'
import dbank from '../dbank.png';
import Web3 from 'web3';
import './App.css';

//h0m3w0rk - add new tab to check accrued interest

class App extends Component {

  async componentWillMount() {
    await this.loadBlockchainData(this.props.dispatch)
  }

  async loadBlockchainData(dispatch) {

    //check if MetaMask exists
    if (typeof window.ethereum !== 'undefined') {
      await window.ethereum.enable()
      //const web3 = new Web3(window.ethereum)
      const web3 = new Web3(Web3.givenProvider)
      const netId = await web3.eth.net.getId()
      const networkType = await web3.eth.net.getNetworkType()
      const networkProvidor = web3.eth.net.currentProvider
      console.log('Network = ', netId, networkType, networkProvidor)
      const accounts = await web3.eth.getAccounts()
      console.log("-> accounts are :", accounts);

      if (typeof accounts[0] !== 'undefined') {
        const balance = await web3.eth.getBalance(accounts[0])
        const ethBalance = await web3.utils.fromWei(balance)
        console.log("-> account balance", ethBalance, 'ETH')
        this.setState({ account: accounts[0], balance: balance, web3: web3 })
      } else {
        window.alert('Please login with Metamask!')
      }

      try {
        const token = new web3.eth.Contract(Token.abi, Token.networks[netId].address)
        const dBankAddress = dBank.networks[netId].address
        const dbank = new web3.eth.Contract(dBank.abi, dBankAddress)
        this.setState({ token: token, dbank: dbank, dBankAddress: dBankAddress })
        console.log('dBank Address : ', dBankAddress)
        const mTokenBalance = await token.methods.balanceOf(this.state.account).call()
        console.log('Your balance in DBC : ', web3.utils.fromWei(mTokenBalance))
      } catch (e) {
        console.log('Error: Contrats are not deployed : ', e)
        window.alert('Contrats are not deployed!')
      }


    } else {
      window.alert('Please install Metamask extention to your browser!')
    }
  }

  async deposit(amount) {
    console.log('Amount deposited = ', amount)
    try {
      await this.state.dbank.methods.deposit().send({ value: amount.toString(), from: this.state.account })
    } catch (e) {
      console.log('Error ', e)
    }
  }

  async withdraw(e) {
    e.preventDefault()
    if (this.state.dbank !== 'undefined') {
      try {
        await this.state.dbank.methods.withdraw().send({ from: this.state.account })
      } catch (e) {
        console.log('Error ', e)
      }
    }

  }

  constructor(props) {
    super(props)
    this.state = {
      web3: 'undefined',
      account: '',
      token: null,
      dbank: null,
      balance: 0,
      dBankAddress: null
    }
  }

  render() {
    return (
      <div className='text-monospace'>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={dbank} className="App-logo" alt="logo" height="32" />
            <b>dBank</b>
          </a>
        </nav>
        <div className="container-fluid mt-5 text-center">
          <br></br>
          <h1>Welcome to my Bank</h1>
          <h2>{this.state.account}</h2>
          <br></br>
          <div className="row">
            <main role="main" className="col-lg-12 d-flex text-center">
              <div className="content mr-auto ml-auto">
                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                  <Tab eventKey="deosit" title="Deposit">
                    <div>
                      <br></br>
                      How much do you want to deposit?
                      <br></br>
                      (min amount is 0.01 ETH)
                      <br></br>
                      (1 deposit at a time please. No more!)
                      <br></br>
                      <form onSubmit={(e) => {
                        e.preventDefault()
                        let amount = this.depositAmount.value
                        amount = Web3.utils.toWei(amount)
                        this.deposit(amount)
                      }}>
                        <div className='form-group mr-sm-2'>
                          <br></br>
                          <input
                            id='depositAmount'
                            step="0.1"
                            type='number'
                            className='form-control form-control-md'
                            placeholder="amount..."
                            required
                            ref={(input) => { this.depositAmount = input }}
                          />
                        </div>
                        <button type='submit' className='btn btn-primary'>DEPOSIT</button>
                      </form>
                    </div>
                  </Tab>
                  <Tab eventKey="withdraw" title="Withdraw">
                    <div>
                      <br></br>
                      How much do you want to withdraw with intrest?
                      <br></br>
                      (The withdraw will reset your account!)
                      <br></br>
                      <button type='submit' className='btn btn-primary' onClick={(e) => this.withdraw(e)}>WITHDRAW</button>
                    </div>
                  </Tab>
                </Tabs>
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
// Import the page's CSS. Webpack will know what to do with it.
import "bootstrap/dist/css/bootstrap.css";
import "../stylesheets/app.css";

// Import libraries we need.
import { default as Web3} from 'web3';
import { default as contract } from 'truffle-contract'

// Import our contract artifacts and turn them into usable abstractions.
import metacoin_artifacts from '../../build/contracts/MetaCoin.json'

// MetaCoin is our usable abstraction, which we'll use through the code below.
var MetaCoin = contract(metacoin_artifacts);

// The following code is simple to show off interacting with your contracts.
// As your needs grow you will likely need to change its form and structure.
// For application bootstrapping, check out window.addEventListener below.
var accounts;
var account;
var gasLimit = 500000;

window.App = {

  listenToEvents: function() {
    var self = this;

    MetaCoin.deployed().then(function(instance) {
      instance.Transfer().watch(function(error, event) {
        let params = event.args;
        self.setStatus(params.value + " transferred successfully");
        console.log(JSON.stringify(params.value + " transferred successfully"));
        self.refreshBalance();
      });
      instance.Approval().watch(function(error, event) {
        let params2 = event.args;
        self.setStatus(params2._spender + " is allowed to spend " + params2._value + " of your MetaCoins");
        console.log(params2._spender + " is allowed to spend " + params2._value + " of your MetaCoins");
        self.refreshBalance();
      });
      instance.FrozenFund().watch(function(error, event) {
        let params = event.args;
        self.setStatus(params.target + " is frozen: " + params.frozen );
        console.log(params.target + " is frozen: " + params.frozen);
        self.refreshBalance();
      });
    });
  },

  start: function() {
    var self = this;

    console.log('Start Page ');   // kyd

    // Bootstrap the MetaCoin abstraction for Use.
    MetaCoin.setProvider(web3.currentProvider);

    // Get the initial account balance so it can be displayed.
    web3.eth.getAccounts(function(err, accs) {
      if (err != null) {
        alert("There was an error fetching your accounts.");
        return;
      }

      if (accs.length == 0) {
        alert("Couldn't get any accounts! Make sure your Ethereum client is configured correctly.");
        return;
      }

      accounts = accs;
      account = accounts[0];

      console.log('account = ' + account);   // kyd

      self.refreshBalance();
      self.listenToEvents();
    });
  },

  setStatus: function(message) {
    var status = document.getElementById("status");
    status.innerHTML = message;
  },

  transfer: function(receiver, amount) {
    var self = this;
    var meta;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.transfer(receiver, amount, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Transfer Complete.");
    }).catch(function(e) {
      self.setStatus("Error sending coin; see log.");
      console.log(e);
    });
  },

  transferFrom: function(from, receiver, amount) {
    var self = this;
    var meta;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.transferFrom(from, receiver, amount, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Transfer Complete.");
    }).catch(function(e) {
      self.setStatus("Error sending coin; see log.");
      console.log(e);
    });
  },

  transferFund: function() {
    var self = this;

    var fromAddress = document.getElementById("transferFrom").value;
    var amount = parseInt(document.getElementById("transferAmount").value);
    var receiverAddress = document.getElementById("transferReceiver").value;

    if (fromAddress === null || fromAddress.length < 10)
      self.transfer(receiverAddress, amount);
    else {
      self.transferFrom(fromAddress, receiverAddress, amount)
    }
  },

  buyToken: function() {
    var self = this;
    var meta;
    var amount = parseInt(document.getElementById("buy_amount").value);

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.buy({from:account, value:amount, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Token purchase complete.");
    }).catch(function(e) {
      self.setStatus("Error token purchase; see log.");
      console.log(e);
    });
  },

  sellToken: function() {
    var self = this;
    var meta;
    var amount = parseInt(document.getElementById("sell_amount").value);

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sell(amount, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Token sale complete.");
    }).catch(function(e) {
      self.setStatus("Error token sale; see log.");
      console.log(e);
    });
  },

  approveFund: function() {
    var self = this;
    var meta;

    var amount = parseInt(document.getElementById("transferAmount").value);
    var receiverAddress = document.getElementById("transferReceiver").value;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.approve(receiverAddress, amount, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Approve Complete.");
    }).catch(function(e) {
      self.setStatus("Error approve allowance; see log.");
      console.log(e);
    });
  },

  freezeAccount: function() {
    var self = this;
    var meta;

    var isFreeze = (document.getElementById("is_freeze_account").value === 'true');
    var receiver = document.getElementById("freeze_receiver").value;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.freezeAccount(receiver, isFreeze, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("Account frozen. " + receiver);
    }).catch(function(e) {
      self.setStatus("Error while freezing account; see log.");
      console.log(e);
    });
  },

  mintToken: function() {
    var self = this;
    var meta;

    var amount = parseInt(document.getElementById("mint_amount").value);
    var receiver = document.getElementById("mint_receiver").value;

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.mintToken(receiver, amount, {from:account, gas:gasLimit});
    }).then(function() {
      self.refreshBalance();
      self.setStatus("New token minted.");
    }).catch(function(e) {
      self.setStatus("New token was not minted; see log.");
      console.log(e);
    });
  },

  setPrices: function() {
    var self = this;
    var meta;

    var sellPrice = parseInt(document.getElementById("sell_price").value);
    var buyPrice = parseInt(document.getElementById("buy_price").value);

    return MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.setPrices(sellPrice, buyPrice, {from:account, gas:gasLimit});
    }).then(function() {
      self.setStatus("Buy/Sell price set!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log('ERROR setPrice(): ' + e);
    });
  },

  refreshBalance: function() {
    var self = this;

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.balanceOf.call(account, {from: account});
    }).then(function(value) {
      var balance_element = document.getElementById("balance");
      balance_element.innerHTML = value.valueOf();
      var contract_element = document.getElementById("contract_address");
      contract_element.innerHTML = meta.address;
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error getting balance; see log.");
    });
  },

  sendCoin: function() {
    var self = this;

    var amount = parseInt(document.getElementById("amount").value);
    var receiver = document.getElementById("receiver").value;

    this.setStatus("Initiating transaction... (please wait)");

    var meta;
    MetaCoin.deployed().then(function(instance) {
      meta = instance;
      return meta.sendCoin(receiver, amount, {from: account});
    }).then(function() {
      self.setStatus("Transaction complete!");
      self.refreshBalance();
    }).catch(function(e) {
      console.log(e);
      self.setStatus("Error sending coin; see log.");
    });
  }

};


window.addEventListener('load', function() {
  // Checking if Web3 has been injected by the browser (Mist/MetaMask)
  if (typeof web3 !== 'undefined') {
    console.warn("Using web3 detected from external source. If you find that your accounts don't appear or you have 0 MetaCoin, ensure you've configured that source properly. If using MetaMask, see the following link. Feel free to delete this warning. :) http://truffleframework.com/tutorials/truffle-and-metamask")
    // Use Mist/MetaMask's provider
    window.web3 = new Web3(web3.currentProvider);
  } else {
    console.warn("No web3 detected. Falling back to http://localhost:8545. You should remove this fallback when you deploy live, as it's inherently insecure. Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
    // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
    window.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
  }

  App.start();
});

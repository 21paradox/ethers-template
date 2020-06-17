const config = require("./config.json");
import { Conflux, util as cfxUtil } from 'js-conflux-sdk/dist/js-conflux-sdk.umd.min.js';

// Import the json file from build to get the abi
const ErcJson = require("./build/ERC20.json"); //import the json of the contract which you want to interact

// You can use any standard network name
//  - "homestead"
//  - "rinkeby"
//  - "ropsten"
//  - "kovan"
//  - "goerli"
const cfx = new Conflux({
    url: 'http://wallet-testnet-jsonrpc.conflux-chain.org:12537',
    logger: console,
});
const account = cfx.Account('0x'  + config.private_key);

// Make a wallet instance using private key and provider

const address = config.ERC20;
const abi = ErcJson.abi;

// Contract Instance with signer
const erc20Contract = cfx.Contract({
    abi,
    address,
});

document.getElementById("send").onsubmit = async function (e) {
    e.preventDefault();
    let address = document.getElementById("address").value;
    document.getElementById("status").innerText = "Waiting for transaction to get published...";

    let txPromise = erc20Contract.transfer(address, cfxUtil.format.bigInt('1000000000000000000'))
        .sendTransaction({ from: account })
    const tx= await txPromise.get();

    console.log(tx)
    let TxHash = tx.hash;
    let node = document.createElement("LI");
    let link = document.createElement("A");
    link.target = "_blank";
    link.href = `https://${config.network}.confluxscan.io/transactionsdetail/` + TxHash;
    let textnode = document.createTextNode(TxHash);
    link.appendChild(textnode);
    node.appendChild(link);
    document.getElementById("transactions").appendChild(node);
    document.getElementById("status").innerText = "Waiting for transaction to be mined...";
    await txPromise.confirmed();
    document.getElementById("status").innerText = "Transaction confirmed";
    return false;
};

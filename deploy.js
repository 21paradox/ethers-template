const ethers = require("ethers");
const config = require("./config.json");
const fs = require("fs-extra");
const { Conflux } = require('js-conflux-sdk');

const provider = ethers.getDefaultProvider(config.network);

const wallet = new ethers.Wallet(config.private_key, provider);
console.log(`Loaded wallet ${wallet.address}`);

let compiled = require(`./build/${process.argv[2]}.json`);

(async () => {
    console.log(`\nDeploying ${process.argv[2]} in ${config.network}...`);
    const cfx = new Conflux({
        url: 'http://wallet-testnet-jsonrpc.conflux-chain.org:12537',
        logger: console,
    });

    const account = cfx.Account('0x'  + config.private_key); // create account instance
    const contract = cfx.Contract({
        abi: compiled.abi,
        bytecode: '0x' + compiled.bytecode
    });
    // deploy the contract, and get `contractCreated`
    const receipt = await contract.constructor(config.decimals, config.symbol, config.name, config.total_supply).sendTransaction({
        from: account,
    })
    .confirmed();

    console.log(receipt, 'receipt'); // receipt.contractCreated: 0x8de528bc539e9be1fe5682f597e1e83f6b4e841b
    console.log("Contract deployed", receipt.transactionHash);
    config[`${process.argv[2]}`] = receipt.contractCreated;

     fs.outputJsonSync(
        "config.json",
        config,
        {
            spaces: 2,
            EOL: "\n"
        }
    );
})();

const fs = require('fs');
const path = require('path');

const contractNames = [
  "AdminConsole",
  'MyNFTStorage',
  'Greener1155',
  'Listing',
  'Commerce'
]

// Gets every contract that has been deployed before.
let contractList = {};
let contracts = path.join(__dirname + '/registry/contracts.json');

if(fs.existsSync(contracts)) {
  content = fs.readFileSync(contracts);
  contractList = JSON.parse(content);
}

async function main(contractName) {
  // Checks if the contract has already been deployed.
  if(contractList[contractName]) {
    console.log(`O Contrato ${contractName} já está na registrado.`)
    return contractList[contractName];
  }

  contractList[contractName] = async () => {
    const ContractFactory = await ethers.getContractFactory(contractName);

    // Removing irrelevant information
    // const gasPrice = await ContractFactory.signer.getGasPrice();
    // console.log(`Current gas price: ${gasPrice}`);
  
    // const estimatedGas = await ContractFactory.signer.estimateGas(
    //     ContractFactory.getDeployTransaction()
    // );
  
    // console.log(`Estimated gas: ${estimatedGas}`);
    // const deploymentPrice = gasPrice.mul(estimatedGas);
    // const deployerBalance = await ContractFactory.signer.getBalance();
    // console.log(`Deployer balance:  ${ethers.utils.formatEther(deployerBalance)}`);
    // console.log( `Deployment price:  ${ethers.utils.formatEther(deploymentPrice)}`);
    // if (Number(deployerBalance) < Number(deploymentPrice)) {
    //     throw new Error("You dont have enough balance to deploy.");
    // }

    // Start deployment, returning a promise that resolves to a contract object
    let mainNetContract = {};
    switch(contractName){
      case 'AdminConsole':        
            mainNetContract = await ContractFactory.deploy();
            await mainNetContract.deployed();
          break;
      case 'MyNFTStorage':    
            mainNetContract = await ContractFactory.deploy(contractList['AdminConsole'].address);
            await mainNetContract.deployed();
          break;
      case 'Greener1155':
          mainNetContract = await ContractFactory.deploy(contractList['MyNFTStorage'].address, contractList['AdminConsole'].address);
          await mainNetContract.deployed();
          break;
      case 'Listing':
          mainNetContract = await ContractFactory.deploy(contractList['MyNFTStorage'].address, contractList['Greener1155'].address);
          await mainNetContract.deployed();
          break;
      case 'Commerce':
          mainNetContract = await ContractFactory.deploy(contractList['MyNFTStorage'].address, contractList['AdminConsole'].address);
          await mainNetContract.deployed();
          break;
      case 'default':
          break;
    }
    
    return mainNetContract;
  };
  
  await contractList[contractName]().then((contractInformation) => {
    contractList[contractName] = contractInformation;

    fs.writeFileSync(contracts, JSON.stringify(Object.defineProperty(contractList, contractName, {
      value: contractInformation,
      enumerable: true,
      configurable: true,
      writable: true
    })));
  });
}

for(let i = 0; i<contractNames.length; i++) {  
  main(contractNames[i]).then(async () => { 
    console.log(`O contrato ${contractNames[i]} foi cadastrado sobre a hash: ${contractList[contractNames[i]].address}`)   
  }).catch(error => console.error(error));
}

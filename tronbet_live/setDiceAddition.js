let prdCfg = {};
try {
  prdCfg = require('/data/tronbet_config/config');
  // prdCfg = require("/data/tronbet_config/config_test");
} catch (error) {
  console.log("using app config");
}

const TronWeb = require("tronweb");
const HttpProvider = TronWeb.providers.HttpProvider;
const fullNode = new HttpProvider(prdCfg.master_full);
const solidityNode = new HttpProvider(prdCfg.master_solidity);
const eventServer = prdCfg.master_event;
const privateKey = prdCfg.operatorDice_pk;

let tronWeb = new TronWeb(fullNode, solidityNode, eventServer, privateKey);

const contract_address = prdCfg.contract.TronBetDiceDev; //合约地址

//获取合约
async function getContractInstance() {
  let contractInstance = await tronWeb.contract().at(contract_address);
  return contractInstance;
}

async function setDiceRate(gameId, startDate, endDate, rate) {
  console.log(gameId, startDate, endDate, rate);
  let contractInstance = await getContractInstance();
  const transactionID = await contractInstance
    .setGamePromotion(gameId, startDate, endDate, rate)
    .send()
    .catch(error => {
      console.log(error);
    });
  console.log(transactionID);
  return transactionID;
}

let gameId = [1, 2, 3, 4];
let startTime = new Date("2019-12-18 00:00:00").getTime() / 1000;
let endTime = new Date("2019-12-22 00:00:00").getTime() / 1000;
const rateInit = 10000;
let rate = 1.5 * rateInit;

// setDiceRate(gameId[0], startTime, endTime, rate);
// setDiceRate(gameId[1], startTime, endTime, rate);
// setDiceRate(gameId[2], startTime, endTime, rate);
// setDiceRate(gameId[3], startTime, endTime, rate);
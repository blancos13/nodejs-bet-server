
const axios = require('axios');
const TronWeb = require('tronweb');
const BigNumber = require('bignumber.js');
const _ = require('lodash')._;
const log4js = require('../configs/log4js.config');
const loggerError = log4js.getLogger('error');
const tronNodePool = require('./tronNodePool');
const getTronWeb = tronNodePool.getTronWeb;

//签名交易
let signTransaction = async (_transaction, _privateKey) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    let fullNodeUrl = tronWeb.fullNode.host;
    return axios.post(fullNodeUrl + '/wallet/gettransactionsign', {
        transaction: _transaction,
        privateKey: _privateKey
    });
}

//广播交易
let sendRawTransaction = async (_signData) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    let fullNodeUrl = tronWeb.fullNode.host;
    return axios.post(fullNodeUrl + '/wallet/broadcasttransaction', _signData);
}

//执行交易
let commitTransaction = async (_contractAddr, _functionSelector, _fee, _callVal, _pamarmArray, _privateKey, _callback) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    let fee = _fee || 1;
    let txID = null;
    return tronWeb.transactionBuilder.triggerSmartContract(_contractAddr, _functionSelector, fee, _callVal, _pamarmArray)
        .then((transaction) => {
            // console.log("transaction.transaction", transaction.transaction);
            txID = transaction.transaction.txID;
            // console.log("commitTransaction->txID",txID);
            if (_privateKey) {
                let _t = transaction.transaction.raw_data.contract[0];
                let _addressHex = TronWeb.address.toHex(TronWeb.address.fromPrivateKey(_privateKey));
                _t.parameter.value.owner_address = _addressHex;
                return signTransaction(transaction.transaction, _privateKey);
            } else {
                return signTransaction(transaction.transaction, tronWeb.defaultPrivateKey);
            }
        }).then((signData) => {
            // console.log("signData.data",signData.data);
            return sendRawTransaction(signData.data);
        }).then((result) => {
            // console.log("result",result);
            // console.log("commitTransaction->txID",txID);
            result.data.txID = txID;
            if (_callback) {
                _callback(null, result.data);
            }
            return result.data;
        }).catch((e) => {
            loggerError.error("WTF! commitTransaction", e);
            if (_callback) {
                _callback(e, null);
            }
            return e;
        });
}

//查询合约
let queryTransaction = async (_contractAddr, _functionSelector, _pamarmArray, _callback) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    tronWeb.transactionBuilder.triggerSmartContract(_contractAddr, _functionSelector, 1, 0, _pamarmArray, (err, result) => {
        if (err) { 
            loggerError.error("queryTransaction error",err);
            if (_callback) { 
                _callback(err, null);
                return;
            } 
        }
        if (_callback) _callback(null, result);
    });
}

//发送TRX
let sendTrx = async (to, val, _privateKey) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    return new Promise((resolve, reject) => {
        let txID = null;
        return tronWeb.transactionBuilder.sendTrx(to, val)
            .then((transaction) => {
                // console.log("transaction ==>",transaction);
                txID = transaction.txID;
                // loggerDefault.info("sendTrx ==>", to, val, txID);
                if (_privateKey) {
                    let _t = transaction.raw_data.contract[0];
                    let _addressHex = TronWeb.address.toHex(TronWeb.address.fromPrivateKey(_privateKey));
                    _t.parameter.value.owner_address = _addressHex;
                    return signTransaction(transaction, _privateKey);
                } else {
                    return signTransaction(transaction, tronWeb.defaultPrivateKey);
                }
            }).then((signData) => {
                return sendRawTransaction(signData.data);
            }).then((result) => {
                result.data.txID = txID;
                // console.log("result ==>",result.data);
                resolve(result.data);
            }).catch((e) => {
                loggerError.error(e);
                reject(e);
                loggerError.error("WTF! sendTrx");
            });
    })
}

let getTransactionInfoById = async (tx_id) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    return new Promise((resolve, reject) => {
        tronWeb.fullNode.request('wallet/gettransactionbyid', { "value": tx_id }, 'post').then((result) => {
            if (_.isEmpty(result) || _.isEmpty(result.ret)) {
                resolve("UNKNOWN");
            } else if (result.ret[0].contractRet === "SUCCESS") {
                resolve("SUCCESS");
            } else if (result.ret[0].contractRet !== "SUCCESS") {
                resolve("FIAL");
            }
        }).catch((e) => {
            loggerError.error("getTransactionInfoById", e);
        });
    })
}

//是否是合法地址
let isValidAddress = async (address) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    return tronWeb.isAddress(address);
}

//获取账户余额sun
let getBalance = async (hexAddr) => {
    let tronWeb = await getTronWeb();
    if (tronWeb == null) return;
    return tronWeb.fullNode.request('wallet/getaccount', { "address": hexAddr }, 'post');
}

let hexStringToTronAddress = (_hexStr) => {
    return TronWeb.address.fromHex('41' + _hexStr);
}

//十六进制字符串转BigNumber
let hexStringToBigNumber = (_hexStr) => {
    return new BigNumber(_hexStr, 16);
}

// module.exports.commitTransaction = commitTransaction;
// module.exports.sendTrx = sendTrx;
// module.exports.getBalance = getBalance;
// module.exports.hexStringToTronAddress = hexStringToTronAddress;
// module.exports.hexStringToBigNumber = hexStringToBigNumber;
// module.exports.isValidAddress = isValidAddress;
// module.exports.getTransactionInfoById = getTransactionInfoById;
// module.exports.queryTransaction = queryTransaction;

module.exports = {
    commitTransaction,
    queryTransaction,
    getTransactionInfoById,
    sendTrx,
    getBalance,
    isValidAddress,
    hexStringToTronAddress,
    hexStringToBigNumber,
}
const db = require('../utils/dbUtil')
const _ = require('lodash')._

async function userAction(AccountId, RoundId, EMGameId, GPGameId, GPId, TransactionId, RoundStatus, Amount, Device, txId, action, AddsAmount, uid, currency, conn) {
    //update balance
    let updateSql = "update live_balance set balance = balance - ? where uid = ? and currency = ?"
    if (action === 'result') {
        updateSql = "update live_balance set balance = balance + ? where uid = ? and currency = ?"
    }
    await db.execTrans(updateSql, [Amount * 1e6, uid, currency], conn)

    let now = new Date().getTime()
    let sql = "insert into live_action_log_v2(addr, RoundId, EMGameId, GPGameId, GPId, TransactionId, RoundStatus, Amount, Device, txId, action, ts, AddsAmount, currency) values(?,?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let res = await db.execTrans(sql, [AccountId, RoundId, EMGameId, GPGameId, GPId, '' + TransactionId, RoundStatus, Amount, Device, txId, action, now, AddsAmount, currency], conn)
    return res
}

async function userRollBack(AccountId, RoundId, EMGameId, GPGameId, GPId, TransactionId, RoundStatus, Amount, Device, txId, action, uid, currency, conn) {
    let updateSql = ''
    if (action == 'rbbet') {
        updateSql = "update live_balance set balance = balance + ? where uid = ? and currency = ?"
    } else if (action == 'rbresult') {
        updateSql = "update live_balance set balance = balance - ? where uid = ? and currency = ?"
    }
    await db.execTrans(updateSql, [Amount * 1e6, uid, currency], conn)

    let updateStatusSql = "update live_action_log_v2 set txStatus = txStatus - 1 where addr = ? and TransactionId = ?"
    await db.execTrans(updateStatusSql, [AccountId, '' + TransactionId], conn)

    let now = new Date().getTime()
    console.log({ AccountId, RoundId, EMGameId, GPGameId, GPId, TransactionId, RoundStatus, Amount, Device, txId, action })
    let sql = "insert into live_action_log_v2(addr, RoundId, EMGameId, GPGameId, GPId, TransactionId, RoundStatus, Amount, Device, txId, action, ts, currency) values(?,?,?,?,?,?,?,?,?,?,?,?,?)"
    let res = await db.execTrans(sql, [AccountId, RoundId, EMGameId, GPGameId, GPId, 'rb' + TransactionId, RoundStatus, Amount, Device, txId, action, now, currency], conn)
    return res
}

async function getTransactionById(TransactionId) {
    let sql = "select * from live_action_log_v2 where TransactionId = ?"
    return await db.exec(sql, ['' + TransactionId])
}


async function getAccountBySessionId(sessionId) {
    let sql = "select * from live_account where sessionId = ?"
    let res = await db.exec(sql, [sessionId])
    return res
}

async function getUserActionLog(adrr, actionId) {
    let sql = "select * from live_action_log_v2 where addr = ? and actionId = ?"
    let res = await db.exec(sql, [addr, actionId])
    return res
}


async function getUserIdByIssuseId(issuseId) {
    let sql = "select addr from live_freespins where issuseId = ?"
    let res = await db.exec(sql, [issuseId])
    return res
}


async function getUserBalanceByCurrency(uid, currency) {
    let sql = "select round(balance / 1000000, 3) balance from live_balance where uid = ? and currency = ?"
    let res = await db.exec(sql, [uid, currency])
    if (_.isEmpty(res)) return 0
    return res[0].balance || 0
}

async function getAccountrByEmail(email) {
    let sql = "select * from live_account where email = ?"
    return await db.exec(sql, [email])
}

module.exports = {
    userAction,
    userRollBack,
    getAccountBySessionId,
    getUserActionLog,
    getUserIdByIssuseId,
    getTransactionById,
    getUserBalanceByCurrency,
    getAccountrByEmail
}
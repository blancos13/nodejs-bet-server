const {newUtcTime, raw} = require("./../utils/dbutils")

const formatData = (data) => {
    data.forEach(e => {
        if (e.currency === 'TRX') {
            e.amount = e.amount / 1e6
        } else {
            e.amount = e.amount / 1e9
        }
    })
}

const getData = async function (params) {
    const addr = params.addr || ''
    const startDate = params.startDate || ''
    const endDate = params.endDate || ''
    const page = params.page || 1
    const pageNum = params.pageNum || 20000
    //
    const limit = Number(pageNum)
    const offset = (Number(page) - 1) * limit
    const start = newUtcTime(startDate).getTime()
    const end = newUtcTime(endDate).getTime()
    //
    let sqlParams = [addr, start, end]
    //
    let sql = `         
        SELECT
            email,
            orderId,
            currency,
            addr,
            amount,
            from_unixtime(startTs / 1000,'%Y-%m-%d %H:%i:%s') as startTs,
            from_unixtime(endTs / 1000,'%Y-%m-%d %H:%i:%s') as endTs,
            txId,
            status 
        FROM
    tron_live.live_cb_withdraw_log
        where addr = ? and startTs >= ? and startTs <= ?
    `
    let sqlC = `select count(1) as count from (${sql}) as g`
    const crs = await raw(sqlC, sqlParams)
    const count = crs[0].count || 0
    //
    sql += ' limit ?,?'
    sqlParams = sqlParams.concat([offset, limit])
    const rsData = await raw(sql, sqlParams)
    formatData(rsData)
    const rs = {
        count: count,
        rows: rsData
    }
    return rs
}


class QueryDeposit {

    static async getData(params) {
        const data = await getData(params)
        return data
    }

    static async getDataFile(params) {
        const data = await this.getData(params).rows
        const keys = Object.keys(data[0])
        let sbody = ''
        keys.forEach(e => {
            sbody += e + "\t"
        })
        sbody = sbody.trim()
        sbody += "\n"
        //
        data.forEach(e => {
            keys.forEach((k) => {
                let t = e[k] || 0
                sbody = sbody + t + '\t'
            })
            sbody = sbody.trim()
            sbody += '\n'
        })
        return sbody
    }
}

module.exports = QueryDeposit
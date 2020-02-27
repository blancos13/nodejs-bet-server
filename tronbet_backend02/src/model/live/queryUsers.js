const {raw} = require("./../utils/dbutils")

const formatData = (data) => {
    data.forEach(e => {
        if (['TRX','USDT'].includes(e.currency)) {
            e.balance = e.balance / 1e6
        } else {
            e.balance = e.balance / 1e9
        }
    })
}

const getAccount = async function (email) {
    let sql = `
        select
            b.email, 
            a.addr,
            a.balance,
            a.currency
            from live_balance a 
            left join live_account b
            on a.uid = b.uid
        where a.uid = b.uid
    `
    let params = []
    if(email !== ''){
        params = [email,email]
        sql += 'and b.email = ? or a.addr = ?'
    }else {
        return []
    }
    const t = await raw(sql, params)
    formatData(t)
    return t
}


class QueryUsers {

    static async getAccount(email) {
        const data = await getAccount(email)
        return data
    }
}

module.exports = QueryUsers
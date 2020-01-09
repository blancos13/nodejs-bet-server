const fs = require('fs');
const path = require('path');

let prdCfg = {};
try {
  prdCfg = require('/data/tronbet_config/config');
} catch (error) {
  console.log('using app config');
}

let config = {
  env: 'production',
  debug: false,
  app: {
    logPath: path.resolve(__dirname, '../../logs'),
    log: true, //开启日志
    init_ts: 1569906000, // 初始时间戳 2019/10/1 13:00:00
    duration: 86400, //每轮有效时间（秒） 86400
    time_out: 3600, //超时时间（秒）
    dividends_addr: prdCfg.contract.WinDividend,
    staker_addr: prdCfg.contract.TronBetStakerPlus,
    min_pool_trx: 1, //最小分红奖池（单位TRX）
    min_interval_ts: 1500, //发奖最小间隔时间(秒)
    ignore_round_in_db: 0, //忽略数据库中不存在的轮次 ***
    TRC20TokenType: { usdt: { addr: prdCfg.contract.USDT } },
    snapshotValidDuration: 21600,
    dividendStatus: {
      INIT: 0,
      INIT_SNAPSHOT: 1,
      DOING_SNAPSHOT: 2,
      COMPLETE_SNAPSHOT: 3,
      INIT_DIVIDEND: 4,
      DOING_DIVIDEND: 5,
      COMPLETE_DIVIDEND: 6
    }
  },
  tronConfig: {
    node: {
      master: {
        url_full: prdCfg.master_full,
        url_solidity: prdCfg.master_solidity,
        url_event: prdCfg.master_event,
        defaultPk: prdCfg.operatorLive_pk
      },
      slave: {
        url_full: prdCfg.slave_full,
        url_solidity: prdCfg.slave_solidity,
        url_event: prdCfg.slave_event,
        defaultPk: prdCfg.operatorLive_pk
      }
    },
    IGNORE_SOLIDITY_NODE_SCAN: true, //忽略检测静态节点状态
    SCAN_NODE_INTERVAL: 3100, //node 扫描间隔(ms)
    HTTP_TIME_OUT: 15000 //node http request 超时时间(ms)
  },
  redisConfig: {
    host: '127.0.0.1',
    port: 6379,
    db: 0,
    pwd: ''
  },
  mysqlConfig: {
    db_host: prdCfg.mysql.host,
    db_port: prdCfg.mysql.port,
    db_name: 'tron_live',
    db_user: prdCfg.mysql.user,
    db_pwd: prdCfg.mysql.pwd
  }
};

if (process.env.NODE_ENV === 'production' && fs.existsSync(__dirname + '/config.js')) {
  //生产环境
  console.log('>>>Use production config!');
} else if (process.env.NODE_ENV === 'test' && fs.existsSync(__dirname + '/config_test.js')) {
  //测试环境
  config = Object.assign(config, require('./config_test.js'));
} else if (process.env.NODE_ENV === 'development' && fs.existsSync(__dirname + '/config_dev.js')) {
  //开发环境
  config = Object.assign(config, require('./config_dev.js'));
} else {
  config = Object.assign(config, require('./config_dev.js'));
}

module.exports = config;

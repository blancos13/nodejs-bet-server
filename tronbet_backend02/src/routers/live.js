const router = require('koa-router')()
const controller = require('../controller/liveController')

/**
 * query gameId
 */
module.exports = router.get('/getFileByGameId', controller.getFileByGameId)
module.exports = router.get('/getListByGameId', controller.getListByGameId)
module.exports = router.get('/getAccount', controller.getAccount)
module.exports = router.get('/getEM', controller.getEM)
module.exports = router.get('/getHub88', controller.getHub88)
module.exports = router.get('/getSport', controller.getSport)
module.exports = router.get('/getDeposit', controller.getDeposit)
module.exports = router.get('/getWithDraw', controller.getWithDraw)

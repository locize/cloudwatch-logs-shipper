const getLogger = require('./lib/getLogger')
const finish = require('./lib/finish')
const extract = require('./lib/extract')
const getLogs = require('./lib/getLogs')

let customLogHandler
try {
  customLogHandler = require('./customLogHandler')
} catch (e) {}

module.exports.handler = async (event) => {
  const logger = getLogger({
    token: process.env.TOKEN,
    host: process.env.HOST,
    type: process.env.TYPE,
    compress: process.env.COMPRESS === 'true'
  })
  const extracted = await extract(event)
  const logs = getLogs(extracted)
  try {
    if (customLogHandler) {
      const ret = customLogHandler(logs)
      if (ret && typeof ret.then === 'function') await ret
    }
  } catch (e) {}
  logs.forEach((log) => logger.log(log))
  return finish(logger)
}

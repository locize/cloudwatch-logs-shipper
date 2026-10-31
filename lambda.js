import getLogger from './lib/getLogger.js'
import finish from './lib/finish.js'
import extract from './lib/extract.js'
import getLogs, { compileDropRules } from './lib/getLogs.js'
import { existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const hasCustomLogHandler = existsSync(join(__dirname, './customLogHandler.js'))
// compiled once per container: a bad DROP is reported at cold start and drops nothing
let drop = []
if (process.env.DROP && process.env.DROP.length > 0) {
  try {
    drop = compileDropRules(JSON.parse(process.env.DROP))
  } catch (e) {
    console.error(`DROP is not valid, nothing is dropped: ${e.message}`)
  }
}

export const handler = async (event) => {
  const logger = getLogger({
    token: process.env.TOKEN,
    host: process.env.HOST,
    type: process.env.TYPE,
    compress: process.env.COMPRESS === 'true'
  })
  const extracted = await extract(event)
  let omit = []
  if (process.env.OMIT && process.env.OMIT.length > 0) omit = process.env.OMIT.split(',')
  const logs = getLogs(extracted, { omitStartAndEnd: process.env.OMIT_START_AND_END === 'true', reduceReport: process.env.REDUCE_REPORT !== 'false', omit, drop })
  try {
    if (hasCustomLogHandler) {
      const customLogHandler = (await import('./customLogHandler.js')).default
      const ret = customLogHandler(logs)
      if (ret && typeof ret.then === 'function') await ret
    }
  } catch (e) {}
  logs.forEach((log) => logger.log(log))
  return finish(logger)
}

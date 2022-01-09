import getLogger from './lib/getLogger.js'
import finish from './lib/finish.js'
import extract from './lib/extract.js'
import getLogs from './lib/getLogs.js'
import { join, dirname, existsSync } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const hasCustomLogHandler = existsSync(join(__dirname, './customLogHandler.js'))

export const handler = async (event) => {
  const logger = getLogger({
    token: process.env.TOKEN,
    host: process.env.HOST,
    type: process.env.TYPE,
    compress: process.env.COMPRESS === 'true'
  })
  const extracted = await extract(event)
  const logs = getLogs(extracted, { omitStartAndEnd: process.env.OMIT_START_AND_END === 'true' })
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

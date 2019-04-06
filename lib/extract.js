const util = require('util')
const zlib = require('zlib')
const gunzip = util.promisify(zlib.gunzip)

module.exports = async (event) => {
  const decodedData = Buffer.from(event.awslogs.data, 'base64')
  const unzipped = (await gunzip(decodedData)).toString()
  return JSON.parse(unzipped)
}

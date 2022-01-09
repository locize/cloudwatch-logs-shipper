import util from 'util'
import zlib from 'zlib'

const gunzip = util.promisify(zlib.gunzip)

export default async (event) => {
  const decodedData = Buffer.from(event.awslogs.data, 'base64')
  const unzipped = (await gunzip(decodedData)).toString()
  return JSON.parse(unzipped)
}

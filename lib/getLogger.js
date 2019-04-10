const logzio = require('logzio-nodejs')

module.exports = (options) => {
  options = options || {}
  if (!options.token) throw new Error('Please pass a token!')
  return logzio.createLogger({
    host: options.host || 'listener.logz.io',
    protocol: options.protocol || 'https',
    port: options.port || 8071,
    token: options.token,
    type: options.type || 'nodejs',
    compress: typeof options.compress === 'boolean' ? options.compress : false
  })
}

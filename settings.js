const AWS = require('aws-sdk')
const https = require('https')
const region = process.env.AWS_REGION || 'eu-west-1'
const agent = new https.Agent({
  keepAlive: true, // this makes lambda execution fast
  maxSockets: 50, // this comes from aws-sdk source: https://github.com/aws/aws-sdk-js/blob/dcc1732b4a7fedbe855a90e59950b8e112122ad9/lib/http/node.js#L153
  rejectUnauthorized: true // this comes from aws-sdk source: https://github.com/aws/aws-sdk-js/blob/dcc1732b4a7fedbe855a90e59950b8e112122ad9/lib/http/node.js#L146
})
agent.setMaxListeners(0) // this comes from aws-sdk source: https://github.com/aws/aws-sdk-js/blob/dcc1732b4a7fedbe855a90e59950b8e112122ad9/lib/http/node.js#L145
AWS.config.update({
  region: region,
  httpOptions: {
    agent: agent,
    timeout: 12000
  }
})

try {
  const appSam = require('./app-sam.json')
  process.env.ENVIRONMENT = process.env.ENVIRONMENT || 'dev'
  process.env.LOCIZE_PUBLIC_KEY = process.env.LOCIZE_PUBLIC_KEY || appSam.Mappings.EnvMap[process.env.ENVIRONMENT].locizePublicKey
} catch (e) {}

module.exports = {
  region: region,
  environment: process.env.ENVIRONMENT,
  locize: {
    issuer: 'locize',
    algorithm: 'ES512',
    publicKey: process.env.LOCIZE_PUBLIC_KEY
  }
}

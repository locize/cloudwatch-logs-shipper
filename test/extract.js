import should from 'should'
import extract from '../lib/extract.js'

describe('extract', () => {
  const testEvent = {
    awslogs: {
      data: 'H4sIAKhAeFgAA51Qy27CMBD8FWtPRQohTxLoKWpTWtEIiSC1EkFRoAtYOHFkm75Q/r0mUIkeemjti3dmdzw7ByhRymKDs48aYQi30SzKkzhNo1EMBvC3CoWGrYujYcY3I8H3tWYUStXVdXfTAi2XKoFFeUnKE2KA3C/lStBaUV7dUaZQSBjOT43rtoZFqxG/YqWO3AHoy9GB7bie3w/Cwd9e+k9F9Y6qKLVd2ws9J/C9ILAt1/jeXcsfMtgqVed7iSLXUKUyGGaQ8E/KWNHzTYtcJcWKVorL7TV5qBQyogEySckzsa3cdnK7Q6K6ZviEyzFVPd8NTLdPrsb3s+TRIIzukIxwteMdcrMVvMSer2VNJwxdc+CTtFgXgp6nMjAy0JGxnNatkdBsbwYNNMY5kn8m0v81EvtHJPN4Op1MFyR+130MCQrBBTnzJjSL5gvKaXciPQIAAA=='
    }
  }
  const expectedExtraction = {
    messageType: 'DATA_MESSAGE',
    owner: '000000000000',
    logGroup: 'test-log-group',
    logStream: 'test-log-stream',
    subscriptionFilters: [ 'test-filter' ],
    logEvents: [
      {
        id: '01234567890123456789012345678901234567890123456789012345',
        timestamp: 1484275477103,
        message:
          '{"http_user_agent":"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36","real_ip":"8.8.8.8"}'
      },
      {
        id: '12345678901234567890123456789012345678901234567890123456',
        timestamp: 1484275477113,
        message: '[ERROR] Example error message.'
      } ]
  }

  it('should work as expected', async () => {
    const data = await extract(testEvent)
    should(data).eql(expectedExtraction)
  })
})

'use strict'

const log = require('kittie')
const Pubsub = require('./pubsub')

const TOPIC_NAME = process.env.TOPIC_NAME || 'testtopic'
const INFINITE = process.env.INFINITE === '1'

const client = new Pubsub(TOPIC_NAME)
client.connect((err) => {
  if (err) throw err

  log.info('pubsub connected, topic created')

  for (var i = 0; i < 10; i++) {
    sendMessage()
  }

  if (INFINITE) {
    setTimeout(() => {
      setInterval(() => {
        sendMessage()
      }, 1000)
    }, 2000)
  }
})

var msg_count = 0
function getMessage() {
  return {
    id: msg_count++
  , title: 'biscuits'
  }
}

function sendMessage() {
  const msg = getMessage()
  log.info('publish', msg.id)
  const start = process.hrtime()
  client.publish(msg, (err) => {
    const diff = process.hrtime(start)
    const duration = `${diff[0] * 1000 + diff[1] / 1e6}ms`
    if (err) {
      log.error(err, {
        err
      , message: 'failed to publish message'
      , duration
      })
      return
    }

    log.info('successfully published message', {
      msg
    , duration
    })
  })
}

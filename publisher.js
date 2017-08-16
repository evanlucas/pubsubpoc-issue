'use strict'

const log = require('kittie')
const Pubsub = require('./pubsub')

const TOPIC_NAME = process.env.TOPIC_NAME || 'testtopic'

const client = new Pubsub(TOPIC_NAME)
client.connect((err) => {
  if (err) throw err

  log.info('pubsub connected, topic created')

  for (var i = 0; i < 10; i++) {
    sendMessage()
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
  client.publish(msg, (err) => {
    if (err) {
      log.error(err, {
        err
      , message: 'failed to publish message'
      })
      return
    }

    log.info('successfully published message', {
      msg
    })
  })
}

'use strict'

const log = require('kittie')
const Pubsub = require('./pubsub')

const TOPIC_NAME = process.env.TOPIC_NAME || 'testtopic'

const client = new Pubsub(TOPIC_NAME)
client.connect((err) => {
  if (err) throw err

  log.info('pubsub connected, topic created')
  const topic = client.topics.get(TOPIC_NAME)
  const sub = topic.subscription('subscription', {
    timeout: 1000
  })

  sub.on('error', onError)
  sub.create((err) => {
    if (err) {
      log.error(err, {
        err
      , message: 'failed to create subscription'
      })
      throw err
    }

    log.info('subscribed')
    sub.on('message', onMessage)
  })
})

function onError(err) {
  log.error(err, {
    err
  , message: 'subscription error'
  })
}

function onMessage(msg) {
  handle(msg, (err, output) => {
    if (!err) {
      log.info('success', output)
    }

    msg.ack((err) => {
      if (err) {
        log.error(err, {
          err
        , message: 'failed to ack message'
        , msg
        , output
        })
      }
    })
  })
}

function handle(msg, cb) {
  const contents = tryParseMessage(msg.data)
  const publishTime = new Date(msg.publishTime)
  const receivedTime = new Date(msg.received)
  const diff = receivedTime.getTime() - publishTime.getTime()
  log.info('handle message', {
    ackId: msg.ackId
  , attributes: msg.attributes
  , publishTime: msg.publishTime
  , received: msg.received
  , data: contents || msg.data
  , took: `${diff}ms`
  })

  setTimeout(() => {
    cb(null, {
      message: 'success'
    })
  }, getRandomDelay())
}

function getRandomDelay() {
  return Math.floor(Math.random() * (1500 - 150 + 1)) + 150
}

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

function tryParseMessage(msg) {
  try {
    return JSON.parse(msg)
  } catch (err) {
    log.warn('unable to parse msg', msg)
    return undefined
  }
}

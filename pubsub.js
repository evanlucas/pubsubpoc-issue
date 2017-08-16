'use strict'

const PubSub = require('@google-cloud/pubsub')
const PROJECT_ID = process.env.GCLOUD_PROJECT_ID
if (!PROJECT_ID) {
  throw new Error('Please set GCLOUD_PROJECT_ID env var')
}

function createClient() {
  if (process.env.GCLOUD_EMAIL && process.env.GCLOUD_PRIVATE_KEY) {
    return PubSub({
      projectId: PROJECT_ID
    , credentials: {
        client_email: process.env.GCLOUD_EMAIL
      , private_key: process.env.GCLOUD_PRIVATE_KEY
      }
    })
  }

  return PubSub({
    projectId: PROJECT_ID
  })
}

module.exports = class Client {
  constructor(topic_name) {
    this.client = createClient()
    this.topic_name = topic_name
    this.topics = new Map()
    this.publishers = new Map()
  }

  getTopic(name, cb) {
    this.client.createTopic(name, (err, t) => {
      if (err) {
        // In the previous version, err.code === 409 if the topic exists
        // In the rewrite, err.code === 6 if the topic exists
        if (err.code === 409 || err.code === 6) {
          return cb(null, this.client.topic(name))
        }
      }

      cb(err, t)
    })
  }

  connect(cb) {
    this.getTopic(this.topic_name, (err, t) => {
      if (err) return cb(err)
      this.topics.set(this.topic_name, t)
      this.publishers.set(this.topic_name, t.publisher({
        maxMilliseconds: 250
      }))
      cb()
    })
  }

  publish(msg, cb) {
    console.log('msg', msg)
    const pub = this.publishers.get(this.topic_name)
    if (typeof msg === 'string') {
      pub.publish(Buffer.from(msg), cb)
      return
    }

    if (typeof msg === 'object') {
      pub.publish(Buffer.from(JSON.stringify(msg)), cb)
      return
    }

    pub.publish(msg, cb)
  }
}

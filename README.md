# Google Pubsub PoC

This repository is meant to reproduce an issue with the updated
pubsub client package for node.

## Setup

```bash
$ npm install
```

We will also need to link in a local version of the pubsub package.
Clone https://github.com/GoogleCloudPlatform/google-cloud-node/.

```bash
$ git clone https://github.com/GoogleCloudPlatform/google-cloud-node
$ cd google-cloud-node/packages/pubsub
$ curl -L https://github.com/GoogleCloudPlatform/google-cloud-node/pull/2380.patch | git am
$ npm link .
```

Then, come back to this directory and run:

```bash
$ npm link @google-cloud/pubsub
```

You should now be able to run the poc.

So far, it seems to only happen when running in k8s. I can't get it
to reproduce locally.

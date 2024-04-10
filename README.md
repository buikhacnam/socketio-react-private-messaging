# socket.io private messaging with React

This is an alternative of the  [private messaging](https://socket.io/get-started/private-messaging-part-4/) official example from [socket.IO](https://socket.io/), but written in React and TypeScript instead. Check the original source code [here](https://github.com/socketio/socket.io/tree/main/examples/private-messaging).

## Prerequisites

- Node.js
- Redis (or Docker to run it)

## How to run

### server

```bash
cd server
yarn install
yarn start
```

if you don't have Redis installed, you can run it with Docker:

```bash
docker-compose up -d
```

### client

```bash
cd client
yarn install
yarn dev
```

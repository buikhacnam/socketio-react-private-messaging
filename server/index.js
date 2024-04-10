const httpServer = require('http').createServer()
const { setupWorker } = require('@socket.io/sticky')
const ORIGIN = 'http://localhost:5173'

const Redis = require('ioredis')
const redisClient = new Redis()
const io = require('socket.io')(httpServer, {
	cors: {
		origin: ORIGIN,
	},
	adapter: require('socket.io-redis')({
		pubClient: redisClient,
		subClient: redisClient.duplicate(),
	}),
})

const { RedisMessageStore } = require('./messageStore')
const messageStore = new RedisMessageStore(redisClient)

const crypto = require('crypto')
const randomId = () => crypto.randomBytes(8).toString('hex')

const { RedisSessionStore } = require('./sessionStore')
const sessionStore = new RedisSessionStore(redisClient)

// middleware to authenticate the user
io.use(async (socket, next) => {
	const sessionID = socket.handshake.auth.sessionID
	if (sessionID) {
		const session = await sessionStore.findSession(sessionID)
		if (session) {
			socket.sessionID = sessionID
			socket.userID = session.userID
			socket.username = session.username
			return next()
		}
	}

	const username = socket.handshake.auth.username
	if (!username) {
		return next(new Error('invalid username'))
	}

	socket.sessionID = randomId()
	socket.userID = randomId()
	socket.username = username
	next()
})

io.on('connection', async socket => {
	console.log('connected', socket.id, socket.userID, socket.username)

	sessionStore.saveSession(socket.sessionID, {
		userID: socket.userID,
		username: socket.username,
		connected: true,
	})

	socket.emit('session', {
		sessionID: socket.sessionID,
		userID: socket.userID,
	})

	// join the "userID" room
	socket.join(socket.userID)

	const users = []
	const [messages, sessions] = await Promise.all([
		messageStore.findMessagesForUser(socket.userID),
		sessionStore.findAllSessions(),
	])

	const messagesPerUser = new Map()
	messages.forEach(message => {
		const { from, to } = message
		const otherUser = socket.userID === from ? to : from
		if (messagesPerUser.has(otherUser)) {
			messagesPerUser.get(otherUser).push(message)
		} else {
			messagesPerUser.set(otherUser, [message])
		}
	})

	sessions.forEach(session => {
		users.push({
			userID: session.userID,
			username: session.username,
			connected: session.connected,
			messages: messagesPerUser.get(session.userID) || [],
		})
	})
	socket.emit('users', users)

	socket.broadcast.emit('user connected', {
		sessionID: socket.sessionID,
		userID: socket.userID,
		username: socket.username,
		connected: true,
	})

	socket.on('private message', ({ content, to }) => {
		const message = {
			content,
			from: socket.userID,
			to,
		}

		socket.to(to).to(socket.userID).emit('private message', message)

		messageStore.saveMessage(message)
	})

	socket.on('disconnect', async () => {
		const matchingSockets = await io.in(socket.userID).allSockets()
		const isDisconnected = matchingSockets.size === 0
		if (isDisconnected) {
			socket.broadcast.emit('user disconnected', socket.userID)

			sessionStore.saveSession(socket.sessionID, {
				userID: socket.userID,
				username: socket.username,
				connected: false,
			})
		}
	})
})

setupWorker(io)

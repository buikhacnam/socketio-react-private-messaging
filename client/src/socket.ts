import { Socket, io } from 'socket.io-client'
interface AppSocket extends Socket {
	userID?: string
}

const URL = 'http://localhost:4000'
const socket: AppSocket = io(URL, { autoConnect: false })

socket.onAny((event: string, ...args: TODO[]) => {
	console.log('SOCKET: ', event, args)
})

export default socket

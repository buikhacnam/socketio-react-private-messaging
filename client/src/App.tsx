import { useState, useEffect } from 'react'
import SelectUsername from './components/SelectUsername'
import Chat from './components/Chat'
import socket from './socket'
import './App.css'
function App() {
	const [usernameAlreadySelected, setUsernameAlreadySelected] =
		useState(false)

	const onUsernameSelection = (username: string) => {
		setUsernameAlreadySelected(true)
		socket.auth = { username }
		socket.connect()
	}

	const handleConnectError = (err: TODO) => {
		if (err.message === 'invalid username') {
			setUsernameAlreadySelected(false)
		}
	}

	useEffect(() => {
		const sessionID = localStorage.getItem('sessionID')
		if (sessionID) {
			setUsernameAlreadySelected(true)
			socket.auth = { sessionID }
			socket.connect()
		}

		socket.on(
			'session',
			({ sessionID, userID }: { sessionID: string; userID: string }) => {
				// attach the session ID to the next reconnection attempts
				socket.auth = { sessionID }
				// store it in the localStorage
				localStorage.setItem('sessionID', sessionID)
				socket.userID = userID
			}
		)

		socket.on('connect_error', handleConnectError)

		// Cleanup function
		return () => {
			socket.off('connect_error', handleConnectError)
			socket.off('session')
		}
	}, [])

	return (
		<div id='app'>
			{!usernameAlreadySelected ? (
				<SelectUsername onInput={onUsernameSelection} />
			) : (
				<Chat />
			)}
		</div>
	)
}

export default App

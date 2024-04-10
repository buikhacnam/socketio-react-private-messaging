import { useState, useEffect } from 'react'
import socket from '../socket'
import User from './User'
import MessagePanel from './MessagePanel'
import { IUser } from '../types'

function Chat() {
	const [selectedUser, setSelectedUser] = useState<IUser | null>(null)
	const [users, setUsers] = useState<IUser[]>([])

	const onMessage = (content: string) => {
		if (selectedUser) {
			socket.emit('private message', {
				content,
				to: selectedUser.userID,
			})
			const updatedUsers = users.map(user =>
				user.userID === selectedUser.userID // if find user is the selected user -> add message to the user(receiver)
					? {
							...user,
							messages: [
								...user.messages,
								{ content, fromSelf: true },
							],
							// eslint-disable-next-line no-mixed-spaces-and-tabs
					  }
					: user
			)
			setUsers(updatedUsers)
		}
	}

	const onSelectUser = (user: IUser) => {
		setSelectedUser(user)
		const updatedUsers = users.map(
			u =>
				u.userID === user.userID ? { ...u, hasNewMessages: false } : u // remove new message indicator if user is selected
		)
		setUsers(updatedUsers)
	}

	const initReactiveProperties = (user: IUser) => {
		return {
			...user,
			connected: true,
			messages:
				user?.messages?.map(message => ({
					...message,
					fromSelf: message.from === socket.userID,
				})) || [],
			hasNewMessages: false,
			self: user.userID === socket.userID,
		}
	}

	useEffect(() => {
		socket.on('connect', () => {
			setUsers(users =>
				users.map(
					user => (user.self ? { ...user, connected: true } : user) // if user is self -> set connected to true, test by stopping the server
				)
			)
		})

		socket.on('disconnect', () => {
			setUsers(users =>
				users.map(
					user => (user.self ? { ...user, connected: false } : user) // if user is self -> set connected to false, test by stopping the server
				)
			)
		})

		socket.on('users', (users: IUser[]) => {
			const updatedUsers = users
				.map((user: IUser) => {
					return {
						...user,
						...initReactiveProperties(user),
					}
				})
				.sort((a: IUser, b: IUser) => {
					// Sort by self and username
					if (a.self) return -1
					if (b.self) return 1
					return a.username.localeCompare(b.username)
				})
			setUsers(updatedUsers)
		})

		socket.on('user connected', newUser => {
			const existingUser = users.find(
				user => user.userID === newUser.userID
			)
			if (existingUser) {
				const updatedUsers = users.map(user =>
					user.userID === newUser.userID
						? { ...user, connected: true }
						: user
				)
				setUsers(updatedUsers)
			} else {
				const updatedUsers = users.concat(
					initReactiveProperties(newUser)
				)
				setUsers(updatedUsers)
			}
		})

		socket.on('user disconnected', id => {
			setUsers(users =>
				users.map(user =>
					user.userID === id ? { ...user, connected: false } : user
				)
			)
		})

		socket.on(
			'private message',
			({
				content,
				from,
				to,
			}: {
				content: string
				from: string
				to: string
			}) => {
				setUsers(users =>
					users.map(user => {
						if (user.userID === from && socket.userID === to) {
							// if find user is the sender -> add message to the user(sender) and fromSelf is false
							return {
								...user,
								messages: [
									...user.messages,
									{
										content,
										fromSelf: false,
									},
								],
								hasNewMessages: user !== selectedUser, // if user(sender) is not selected -> add new message indicator
							}
						}
						if (user.userID === to && socket.userID === from) {
							// if find user is the receiver and is on another tab -> add message to the user(receiver) and fromSelf is true
							return {
								...user,
								messages: [
									...user.messages,
									{
										content,
										fromSelf: true,
									},
								],
								hasNewMessages: false, // if user(receiver) is not selected -> add new message indicator
							}
						}

						return user
					})
				)
			}
		)

		// Cleanup function
		return () => {
			socket.off('connect')
			socket.off('disconnect')
			socket.off('users')
			socket.off('user connected')
			socket.off('user disconnected')
			socket.off('private message')
		}
	}, [selectedUser, users])

	return (
		<div>
			<div className='left-panel'>
				{users.map(user => (
					<User
						key={user.userID}
						user={user}
						selected={selectedUser?.userID === user?.userID}
						onSelect={() => onSelectUser(user)}
					/>
				))}
			</div>
			{selectedUser && (
				<div className='right-panel'>
					<MessagePanel
						user={
							users.find(
								user => user.userID === selectedUser.userID
							)!
						}
						onInput={onMessage}
					/>
				</div>
			)}
		</div>
	)
}

export default Chat

export interface IMessage {
	content: string
	fromSelf: boolean
	from?: string
	to?: string
}

export interface IUser {
	userID: string
	username: string
	connected: boolean
	self: boolean
	messages: Array<IMessage>
	hasNewMessages: boolean
}

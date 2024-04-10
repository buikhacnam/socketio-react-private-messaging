import React, { useState } from 'react';
import StatusIcon from './StatusIcon';
import { IMessage, IUser } from '../types';

function MessagePanel({ user, onInput }: {user: IUser, onInput:(content:string)=>void}) {
    const [input, setInput] = useState('');

    const isValid = input.length > 0;

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isValid) {
            onInput(input);
            setInput('');
        }
    };

    const displaySender = (message:IMessage, index: number) => {
        return (
            index === 0 ||
            user.messages[index - 1].fromSelf !== message.fromSelf
        );
    };

    return (
        <div>
            <div className="header">
                <StatusIcon connected={user.connected} />{user.username} - {user.userID}
            </div>

            <ul className="messages">
                {user.messages.map((message, index) => (
                    <li key={index} className="message">
                        {displaySender(message, index) && (
                            <div className="sender">
                                {message.fromSelf ? "(yourself)" : user.username}
                            </div>
                        )}
                        {message.content}
                    </li>
                ))}
            </ul>

            <form onSubmit={onSubmit} className="form">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Your message..."
                    className="input"
                />
                <button disabled={!isValid} className="send-button">Send</button>
            </form>
        </div>
    );
}

export default MessagePanel;

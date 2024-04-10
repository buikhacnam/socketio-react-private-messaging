import React, { useState } from 'react';

function SelectUsername({ onInput }: {onInput: TODO}) {
    const [username, setUsername] = useState('');

    const isValid = username.length > 2;

    const onSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (isValid) {
            onInput(username);
        }
    };

    return (
        <div className="select-username">
            <form onSubmit={onSubmit}>
                <input 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Your username..." 
                />
                <button disabled={!isValid}>Enter</button>
                <br/>
                <br/>
                <div>username must be at least 3 characters</div>
            </form>
        </div>
    );
}

export default SelectUsername;

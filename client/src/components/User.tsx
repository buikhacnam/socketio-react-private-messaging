import { IUser } from '../types';
import StatusIcon from './StatusIcon';

function User({ user, selected, onSelect }: {
    user:IUser,
    selected:boolean,
    onSelect:(user: IUser) => void
}) {
    const getStatus = () => {
        return user.connected ? "online" : "offline";
    };

    return (
        <div 
            className={`user ${selected ? 'selected' : ''}`} 
            onClick={() => onSelect(user)}
        >
            <div className="description">
                <div className="name">
                    {user.username} {user.self ? " (yourself)" : ""} - {user.userID}
                </div>
                <div className="status">
                    <StatusIcon connected={user.connected} />
                    {getStatus()}
                </div>
            </div>
            {user.hasNewMessages && !selected 
            && <div className="new-messages">!</div>}
        </div>
    );
}

export default User;

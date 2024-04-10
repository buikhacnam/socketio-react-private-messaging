function StatusIcon({ connected }: {connected: boolean}) {
    return (
        <i className={`icon ${connected ? 'connected' : ''}`}></i>
    );
}

export default StatusIcon;

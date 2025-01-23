import Qr from './Qr'

export default () => {
    const url = new URLSearchParams(location.search).get('qr')
    const displayName = new URLSearchParams(location.search).get('displayName')
    return (
        <div>
            <small>{displayName}</small>
            <Qr value={url} />
        </div>
    )
}

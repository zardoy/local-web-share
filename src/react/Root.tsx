import Actions from './Actions'
import DownloadQr from './MainQr'
import Qr from './Qr'

export default () => {
    if (location.search.startsWith('?qr=')) return <Qr value={location.search.slice('?qr='.length)} />

    return (
        <div>
            <Actions />
            <DownloadQr />
        </div>
    )
}

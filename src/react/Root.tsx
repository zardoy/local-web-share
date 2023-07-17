import Actions from './Actions'
import DownloadQr from './MainQr'
import Qr from './Qr'
import Settings from './Settings'

export default () => {
    if (location.search.startsWith('?settings')) return <Settings />
    if (location.search.startsWith('?qr=')) return <Qr value={location.search.slice('?qr='.length)} />

    return (
        <div>
            <Actions />
            <DownloadQr />
        </div>
    )
}

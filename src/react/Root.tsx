import Actions from './Actions'
import DragDropFile from './DragDropFile'
import DownloadQr from './MainQr'
import Qr from './Qr'
import Settings from './Settings'
import ShareFile from './ShareFile'

export default () => {
    if (location.search.startsWith('?settings')) return <Settings />
    if (location.search.startsWith('?qr=')) return <ShareFile />

    return (
        <div>
            <Actions />
            <DownloadQr />
            <DragDropFile />
        </div>
    )
}

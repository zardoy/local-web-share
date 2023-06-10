import { QRCodeCanvas } from 'qrcode.react'
import { useEffect, useState } from 'react'
import { typedIpcRenderer } from 'typed-ipc'

export default () => {
    const [url, setUrl] = useState('')
    const [lastId, setLastId] = useState(null as number | null)

    useEffect(() => {
        typedIpcRenderer.request('requestDownloadQr', {}).then(({ url }) => {
            setUrl(url)
        })
        typedIpcRenderer.addEventListener('updateSendingFiles', (_, { ids }) => {
            setLastId(ids.at(-1)!)
        })
    }, [])

    return !url || !lastId ? <div>Send files first</div> : <QRCodeCanvas value={`http://${url}/${lastId}`} style={{ border: '1px solid white' }} />
}

import { useEffect, useState } from 'react'
import { typedIpcRenderer } from 'typed-ipc'
import Qr from './Qr'

export default () => {
    const [url, setUrl] = useState('')
    const [lastId, setLastId] = useState(null as number | null)

    useEffect(() => {
        // TODO
        typedIpcRenderer.request('requestDownloadQr', {}).then(({ url }) => {
            setUrl(url)
        })
        typedIpcRenderer.addEventListener('updateSendingFiles', (_, { ids }) => {
            setLastId(ids.at(-1)!)
        })
    }, [])

    // return !url /*  || !lastId */ ? <div>Send files first</div> : <Qr value={`${url}/${lastId}`} />
    return (
        url && (
            <div>
                <h2 style={{ color: 'white', fontFamily: 'sans-serif' }}>UI (Send Files):</h2>
                <Qr value={`${url}/ui`} />
            </div>
        )
    )
}

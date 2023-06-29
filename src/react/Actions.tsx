import { useRef } from 'react'
import { typedIpcRenderer } from 'typed-ipc'

export default () => {
    return (
        <div>
            <button
                onClick={() => {
                    typedIpcRenderer.send('openFile', {})
                }}
            >
                Send files...
            </button>
            <button
                onClick={async () => {
                    await typedIpcRenderer.request('createShareMenuOption')
                }}
                hidden={!navigator.userAgent.includes('Windows')}
            >
                Add to file share context menu
            </button>
        </div>
    )
}

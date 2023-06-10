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
            <button>Add to share menu</button>
        </div>
    )
}

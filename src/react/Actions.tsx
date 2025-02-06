import { useRef, useEffect, useState } from 'react'
import { typedIpcRenderer } from 'typed-ipc'

export default () => {
    const [startupEnabled, setStartupEnabled] = useState(false)

    useEffect(() => {
        typedIpcRenderer.request('getStartupState').then(setStartupEnabled)
    }, [])

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
            <button
                onClick={async () => {
                    const newState = await typedIpcRenderer.request('toggleStartup')
                    setStartupEnabled(newState)
                }}
            >
                {startupEnabled ? 'Disable' : 'Enable'} Launch on Startup
            </button>
        </div>
    )
}

import { Button, ButtonGroup, Checkbox } from '@mui/material'
import { useEffect, useState } from 'react'
import { typedIpcRenderer } from 'typed-ipc'
import lodash from 'lodash'

export default () => {
    const [settings, setSettings] = useState(null as Record<string, any> | null)

    useEffect(() => {
        typedIpcRenderer.request('getSettings').then(settings => {
            setSettings(settings.settings)
        })
    }, [])

    const setSetting = (key: string, value: any) => {
        typedIpcRenderer.send('setSetting', {
            key,
            value,
        })
        lodash.set(settings!, key, value)
        setSettings({
            ...settings,
        })
        console.log(settings)
    }

    if (!settings) return null

    return (
        <div>
            <Button variant="outlined" onClick={() => (location.search = '')}>
                Go home
            </Button>
            <br />
            <div>
                <label>
                    <span>Enable play/pause remote button</span>
                    <Checkbox checked={settings['core']['remotePlayPauseButton']} onChange={e => setSetting('core.remotePlayPauseButton', e.target.checked)} />
                </label>
            </div>
            <div>
                <label>
                    <span>Enable remote touchpad</span>
                    <Checkbox checked={settings['core']['remoteTouchpad']} onChange={e => setSetting('core.remoteTouchpad', e.target.checked)} />
                </label>
            </div>
        </div>
    )
}

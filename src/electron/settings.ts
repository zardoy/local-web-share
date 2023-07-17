import ElectronStore from 'electron-store'
import _ from 'lodash'

let store: ElectronStore<Record<string, unknown>>

export const initSettings = () => {
    store = new ElectronStore({
        // schema: undefined,
        name: 'settings',
        watch: true,
    })
    // store.openInEditor()
    console.log(store.store)
    // store.set('core.closeDownloadAfterWindowClose', true)
    Object.assign(settings, store.store)
}

export const setSetting = (key: string, value: any) => {
    store.set(key, value)
    _.set(settings, key, value)
}

const settings = {
    core: {
        // downloadsLimit: 0,
        closeDownloadAfterWindowClose: false,
        // sendingFilesLimit: 1,
        // continueDownload: true,
        // removeSendingFileAfter: 0
        remoteTouchpad: false,
        remotePlayPauseButton: false,
    },
    ui: {
        qrFullSize: 512,
        qrMiniSize: 128,
        // show
    },
}
export default settings

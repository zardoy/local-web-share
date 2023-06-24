import ElectronStore from 'electron-store'

export const initSettings = () => {
    const store = new ElectronStore({
        // schema: undefined,
        name: 'settings',
        watch: true,
    })
    store.openInEditor()
}

export default {
    core: {
        downloadsLimit: 0,
        closeDownloadAfterWindowClose: false,
        sendingFilesLimit: 1,
        continueDownload: true,
        // removeSendingFileAfter: 0
    },
    ui: {
        qrFullSize: 512,
        qrMiniSize: 128,
        // show
    },
}

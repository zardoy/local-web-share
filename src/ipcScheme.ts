export {}

declare module 'typed-ipc' {
    interface IpcMainEvents {
        openFile: {}
    }

    interface IpcRendererEvents {
        updateSendingFiles: {
            ids: number[]
            urls: string[]
        }
    }

    interface IpcMainRequests {
        requestDownloadQr: {
            variables: {}

            response: {
                url: string
            }
        }
        createShareMenuOption: {}
        appInit: {}
    }
}

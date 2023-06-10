export {}

declare module 'typed-ipc' {
    interface IpcMainEvents {
        openFile: {}
    }

    interface IpcRendererEvents {
        updateSendingFiles: {
            ids: number[]
        }
    }

    interface IpcMainRequests {
        requestDownloadQr: {
            variables: {}

            response: {
                url: string
            }
        }
    }
}

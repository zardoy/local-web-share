export {}

declare module 'typed-ipc' {
    interface IpcMainEvents {
        openFile: {}
        setSetting: {
            key: string
            value: any
        }
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
        getSettings: {
            response: {
                settings: Record<string, any>
            }
        }
    }
}

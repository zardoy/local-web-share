export {}

declare module 'typed-ipc' {
    interface IpcMainEvents {
        openFile: {
            path?: string
        }
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
        toggleStartup: {
            response: boolean
        }
        getStartupState: {
            response: boolean
        }
    }
}

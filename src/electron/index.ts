import { BrowserWindow, app, dialog } from 'electron'
import electronIsDev from 'electron-is-dev'
import { getFileFromPublic } from '@zardoy/electron-esbuild/build/client'
import { join } from 'path'
import { addFileToSend, getServerUrl, startServer } from './httpServer'
import { typedIpcMain } from 'typed-ipc'

export let mainWindow: BrowserWindow | null

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 400,
        minWidth: 800,
        minHeight: 600,
        center: true,
        backgroundColor: '#000',
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        },
        title: app.getName(),
    })
    mainWindow.on('close', () => {
        app.quit()
    })
    mainWindow.on('closed', () => (mainWindow = null))
    // mainWindow.setMenu(null);
    void mainWindow.loadURL(electronIsDev ? 'http://localhost:3500' : `file:///${getFileFromPublic('index.html')}`)

    typedIpcMain.bindAllEventListeners({
        async openFile() {
            const files = await dialog.showOpenDialog(mainWindow!, {
                title: 'Select files to send...',
                // properties: ['multiSelections'],
            })
            for (const filePath of files.filePaths) {
                addFileToSend(filePath)
            }
        },
    })
    typedIpcMain.handleAllRequests({
        async requestDownloadQr(_e, {}) {
            const localIp = await getServerUrl()
            if (!localIp) throw new Error('Cannot get local IP, check your connection')
            return {
                url: localIp,
            }
        },
    })
})

startServer()

const getFileFromUnpacked = (path: string) => {
    return join(__dirname, '../../app.asar.unpacked/', path)
}

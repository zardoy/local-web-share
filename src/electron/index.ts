import { BrowserWindow, app, dialog } from 'electron'
import electronIsDev from 'electron-is-dev'
import { getFileFromPublic } from '@zardoy/electron-esbuild/build/client'
import { join } from 'path'
import { addFileToSend, getServerUrl, startServer } from './httpServer'
import { typedIpcMain } from 'typed-ipc'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, writeFileSync } from 'original-fs'

export let mainWindow: BrowserWindow | null

const locked = app.requestSingleInstanceLock()
if (!locked) app.exit()

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
        async createShareMenuOption() {
            if (process.platform !== 'win32' || !process.env.APPDATA) return
            const inkPath = '%APPDATA%/Microsoft/Windows/SendTo/Send With Local Web Share.lnk'.replace('%APPDATA%', process.env.APPDATA!)
            const launchCmdPath = join(__dirname, 'launch.cmd')
            const launchCmd = `${process.execPath} ${__filename} %*`
            if (!existsSync(launchCmdPath)) {
                writeFileSync(launchCmdPath, launchCmd, 'utf8')
            }
            const powerShellCommand = `$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${inkPath}'); $Shortcut.TargetPath = '${launchCmdPath}'; $Shortcut.Save()`
            await promisify(exec)(`powershell.exe -command "${powerShellCommand}"`).then(console.log)
        },
        appInit() {
            handleArgv(process.argv)
        },
    })

    app.on('second-instance', (_e, argv) => {
        const result = handleArgv(argv)
        if (result) mainWindow?.focus()
    })
})

const handleArgv = argv => {
    const curFileIndex = argv.indexOf(__filename)
    if (curFileIndex === -1) throw new Error('No file index')
    const files = argv.slice(curFileIndex)
    // TODO
    const file = files.at(-1)
    if (!file) return
    addFileToSend(file)
    return true
}

startServer()

const getFileFromUnpacked = (path: string) => {
    return join(__dirname, '../../app.asar.unpacked/', path)
}

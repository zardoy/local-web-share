import { BrowserWindow, Menu, MenuItem, app, dialog, shell } from 'electron'
import electronIsDev from 'electron-is-dev'
import { getFileFromPublic } from '@zardoy/electron-esbuild/build/client'
import { join, basename } from 'path'
import { addFileToSend, getFileFromUnpacked, getServerUrl, removeFileFromSend, startServer } from './httpServer'
import { typedIpcMain } from 'typed-ipc'
import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync, writeFileSync } from 'original-fs'
import settings, { initSettings, setSetting } from './settings'
import { filesize } from 'filesize'
import fs from 'fs'

export let mainWindow: BrowserWindow | null

const locked = app.requestSingleInstanceLock()
if (!locked) app.exit()

// todo
const repo = 'https://github.com/zardoy/local-web-share/'

app.on('ready', async () => {
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
    await initSettings()
    mainWindow.setIcon(getAppIcon())
    const defaultMenu = Menu.getApplicationMenu()!
    const customMenu = new Menu()
    customMenu.append(
        new MenuItem({
            role: 'appMenu',
            label: app.getName(),
            submenu: [
                {
                    role: 'about',
                    label: `Version ${process.env.VERSION || 'dev'}`,
                },
                // settings menu item
                {
                    label: 'Settings',
                    click() {
                        loadUrlWindow(mainWindow!, '?settings')
                    },
                },
                {
                    type: 'separator',
                },
                {
                    role: 'quit',
                },
            ],
        }),
    )
    for (const item of defaultMenu.items) {
        if (item.role === 'help') continue
        if (item.role === 'fileMenu') continue
        customMenu.append(item)
    }
    const helpSubmenu = Menu.buildFromTemplate([
        {
            label: 'View source code (homepage)',
            click() {
                shell.openExternal(repo)
            },
        },
        {
            label: 'Report / search issues',
            click() {
                shell.openExternal(`${repo}issues`)
            },
        },
    ])
    customMenu.append(
        new MenuItem({
            role: 'help',
            label: 'Help',
            submenu: helpSubmenu,
        }),
    )
    mainWindow.setMenu(customMenu)
    mainWindow.on('closed', () => {
        app.exit()
    })
    loadUrlWindow(mainWindow)

    typedIpcMain.bindAllEventListeners({
        async openFile(_, { path }) {
            if (path) {
                addFileToSendAndDisplayDownload(path)
                return
            }
            const files = await dialog.showOpenDialog(mainWindow!, {
                title: 'Select files to send...',
                // properties: ['multiSelections'],
            })
            for (const filePath of files.filePaths) {
                addFileToSendAndDisplayDownload(filePath)
            }
        },
        setSetting(_, { key, value }) {
            setSetting(key, value)
        },
    })
    typedIpcMain.handleAllRequests({
        async requestDownloadQr(_e, {}) {
            const url = await getServerUrl()
            if (!url) throw new Error('Cannot get local IP, check your connection')
            return {
                url,
            }
        },
        async createShareMenuOption() {
            if (process.platform !== 'win32' || !process.env.APPDATA) return
            const inkPath = '%APPDATA%/Microsoft/Windows/SendTo/Send With Local Web Share.lnk'.replace('%APPDATA%', process.env.APPDATA!)
            const launchCmdPath = electronIsDev ? join(__dirname, 'launch.cmd') : getFileFromUnpacked('launch.cmd')
            const launchCmd = `${process.execPath} ${__filename} %*`
            writeFileSync(launchCmdPath, launchCmd, 'utf8')

            const powerShellCommand = `$WshShell = New-Object -comObject WScript.Shell; $Shortcut = $WshShell.CreateShortcut('${inkPath}'); $Shortcut.TargetPath = '${launchCmdPath}'; $Shortcut.Save()`
            await promisify(exec)(`powershell.exe -command "${powerShellCommand}"`).then(console.log)
        },
        appInit() {
            handleArgv(process.argv)
        },
        getSettings() {
            return {
                settings,
            }
        },
    })

    app.on('second-instance', (_e, argv) => {
        handleArgv(argv)
    })
})

const getAppIcon = () => {
    return getFileFromUnpacked('icon.png')
}

async function addFileToSendAndDisplayDownload(filePath: string) {
    const { url, id } = await addFileToSend(filePath)
    const fileName = basename(filePath)
    const window = new BrowserWindow({
        width: settings.ui.qrFullSize,
        height: settings.ui.qrFullSize,
        title: `${app.getName()} - ${fileName}`,
        center: true,
        backgroundColor: '#000',
        darkTheme: true,
        resizable: false,
        minimizable: false,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
        },
    })
    // window.setMenu(null)
    // todo watch ip change
    const newUrl = new URLSearchParams()
    newUrl.set('qr', url)
    const sizeRaw = fs.statSync(filePath).size
    const fileSize = filesize(sizeRaw)
    newUrl.set('displayName', `${fileSize} : ${basename(fileName)}`)
    loadUrlWindow(window, `?${newUrl.toString()}`)
    window.on('closed', () => {
        removeFileFromSend(id)
    })
}

const handleArgv = async (argv: string | string[]) => {
    const curFileIndex = argv.indexOf(__filename)
    if (curFileIndex === -1) throw new Error('No file index')
    const files = argv.slice(curFileIndex)
    if (files.length > 2) {
        const result = await dialog.showMessageBox(mainWindow!, {
            message: `You have selected ${files.length} files, you'll need to scan QR for each file seperately. That's why it's recommended to zip them before sending (Send to -> create compressed archive)`,
            buttons: [`Generate ${files.length} QR codes`, 'Cancel'],
            type: 'warning',
        })
        if (result.response === 1) return
    }
    // TODO
    for (const file of files) {
        addFileToSendAndDisplayDownload(file)
    }
    return true
}

startServer()

function loadUrlWindow(window: BrowserWindow, search = '') {
    void window.loadURL(electronIsDev ? `http://localhost:3500${search}` : `file:///${getFileFromPublic('index.html')}${search}`)
}

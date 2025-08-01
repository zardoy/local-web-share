import { networkInterfaces } from 'systeminformation'
import http from 'http'
import fs from 'fs'
import path from 'path'
import * as url from 'url'
import electronIsDev from 'electron-is-dev'
import { join } from 'path'
import formidable from 'formidable'
import { WebSocketServer } from 'ws'
import os from 'os'
import settings from './settings'

let robot: typeof import('robotjs') | undefined

try {
    robot = require('robotjs')
} catch (e) {
    console.log(`Cannot load robotjs, remote control will be disabled`, e.message)
}

const DEFAULT_PORT = 55462
const sendingFiles = new Map<number, /*path*/ string>()
let lastSendingId = 0
let server: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse>

export const startServer = () => {
    server = http.createServer(async (req, res) => {
        // if (req.url !== '/') return res.end('Not found')
        if (!req.url) return
        if (req.url === '/ui') {
            // todo inline?
            return res.end(fs.readFileSync(getFileFromUnpacked('ui.html')))
        }
        if (req.url === '/ui.js') {
            return res.end(fs.readFileSync(getFileFromUnpacked('ui.js')))
        }
        if (req.url === '/fileupload') {
            try {
                const uploadDir = join(os.homedir(), 'Downloads')
                const form = formidable({
                    uploadDir,
                    filename(name, ext, part, form) {
                        const filename = part.originalFilename || name + '.' + ext
                        let postfix = 0
                        while (fs.existsSync(join(uploadDir, filename + postfix))) {
                            postfix++
                        }
                        return filename + postfix
                    },
                })
                //@ts-ignore
                const [fields, files] = await form.parse(req)
                const uploadedFile = files.length ? files[0].originalFilename : undefined
                res.writeHead(302, {
                    Location: `/ui${uploadedFile ? `?uploadSuccess=${encodeURIComponent(uploadedFile)}` : ''}`,
                })
                if (uploadedFile) console.log(`file uploaded ${uploadedFile}`)
                return res.end()
            } catch (err) {
                console.error(err)
                return res.end(String(err))
            }
        }

        const id = +req.url.slice(1)
        const query = url.parse(req.url, true).query
        const filePath = sendingFiles.get(id)
        if (!filePath) return res.end('File id not found')
        const stat = await fs.promises.stat(filePath)
        const readStream = fs.createReadStream(filePath)
        res.setHeader('Content-Length', stat.size)
        res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
        readStream.pipe(res)
        return
    })

    const tryPort = (port: number): Promise<void> => {
        return new Promise((resolve, reject) => {
            server.listen(port)
                .once('listening', () => {
                    console.log(`[remote-ui] Running http server at ${port} port`)
                    resolve()
                })
                .once('error', (err: any) => {
                    if (err.code === 'EADDRINUSE') {
                        console.log(`Port ${port} in use, trying ${port + 1}`)
                        server.close()
                        tryPort(port + 1).then(resolve).catch(reject)
                    } else {
                        reject(err)
                    }
                })
        })
    }

    tryPort(DEFAULT_PORT).then(() => {
        const wss = new WebSocketServer({
            server,
            path: '/ws',
        })
        new Promise<void>(resolve => {
            wss.once('listening', resolve)
        }).then(() => {
            console.log('WebSocketServer is ready')
            const remoteControlHandler = _data => {
                if (!robot) return

                const data = JSON.parse(_data.toString())
                if (settings.core.remoteTouchpad) {
                    if (data.type === 'move') {
                        const pos = robot.getMousePos()
                        robot.moveMouse(pos.x + data.x, pos.y + data.y)
                    }
                    if (data.type === 'click') {
                        robot.mouseClick(data.button || 'left')
                    }
                }
                if (data.type === 'press' && settings.core.remotePlayPauseButton) {
                    robot.keyTap(data.button)
                }
            }
            wss.on('connection', ws => {
                ws.send(
                    JSON.stringify({
                        config: {
                            remoteTouchpad: settings.core.remoteTouchpad,
                            remotePlayPauseButton: settings.core.remotePlayPauseButton,
                        },
                    }),
                )
                ws.on('message', remoteControlHandler)
                ws.on('close', () => {
                    ws.removeEventListener('message', remoteControlHandler)
                })
            })
        })
    })
}

export const addFileToSend = async (filePath: string) => {
    sendingFiles.set(++lastSendingId, filePath)
    const id = lastSendingId
    // typedIpcMain.sendToWindow(mainWindow, 'updateSendingFiles', { ids: [lastSendingId], urls: [] })
    const url = await getServerUrl()
    return { url: `${url}/${id}`, id }
}

export const removeFileFromSend = (id: number) => {
    sendingFiles.delete(id)
}

const getLocalIp = async () => {
    const _interfaces = await networkInterfaces()
    const interfaces = Array.isArray(_interfaces) ? _interfaces : [_interfaces]
    let netInterface = interfaces.find(int => int.default)
    if (!netInterface) {
        netInterface = interfaces.find(int => !int.virtual) ?? interfaces[0]
        console.warn('Failed to obtain default network interface, searching for fallback')
    }
    if (!netInterface) throw new Error('No network interfaces!')
    return netInterface.ip4
}

export const getServerUrl = async () => {
    return `http://${await getLocalIp()}:${(server.address() as any).port}`
}

export const getFileFromUnpacked = (path: string) => {
    if (electronIsDev) return join(process.cwd(), `./assets/`, path)
    return join(__dirname, '../../app.asar.unpacked/assets/', path)
}

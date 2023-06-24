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
import * as robot from 'robotjs'

const remoteHttpPort = 8080
const sendingFiles = new Map<number, /*path*/ string>()
let lastSendingId = 0

export const startServer = () => {
    const server = http.createServer(async (req, res) => {
        // if (req.url !== '/') return res.end('Not found')
        if (!req.url) return
        if (req.url === '/ui') {
            // todo inline?
            return res.end(fs.readFileSync(getFileFromUnpacked('dist/ui.html')))
        }
        if (req.url === '/fileupload') {
            try {
                const form = formidable({
                    uploadDir: join(os.homedir(), 'Downloads'),
                    filename(name, ext, part, form) {
                        return part.originalFilename || name
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
    server.listen(remoteHttpPort, () => {
        console.log(`[remote-ui] Running http server at ${remoteHttpPort} port`)
    })
    const wss = new WebSocketServer({
        server,
        path: '/ws',
    })
    new Promise<void>(resolve => {
        wss.once('listening', resolve)
    }).then(() => {
        console.log('WebSocketServer is ready')
        const handler = _data => {
            const data = JSON.parse(_data.toString())
            if (data.type === 'move') {
                const pos = robot.getMousePos()
                robot.moveMouse(pos.x + data.x, pos.y + data.y)
            }
            if (data.type === 'click') {
                robot.mouseClick()
            }
        }
        wss.on('connection', ws => {
            ws.on('message', handler)
            ws.on('close', () => {
                ws.removeEventListener('message', handler)
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
    return `${await getLocalIp()}:${remoteHttpPort}`
}

export const getFileFromUnpacked = (path: string) => {
    if (electronIsDev) return join(process.cwd(), `/src/react/public/${path}`)
    return join(__dirname, '../../app.asar.unpacked/', path)
}

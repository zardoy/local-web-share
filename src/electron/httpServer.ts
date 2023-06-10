import { networkInterfaces } from 'systeminformation'
import http from 'http'
import fs from 'fs'
import path from 'path'
import * as url from 'url'
import { mainWindow } from '.'
import { typedIpcMain } from 'typed-ipc'

const remoteHttpPort = 8080
const sendingFiles = new Map<number, /*path*/ string>()
let lastSendingId = 0

export const startServer = () => {
    const server = http.createServer(async (req, res) => {
        // if (req.url !== '/') return res.end('Not found')
        if (!req.url) return
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
    // const wss = new WebSocketServer({
    //     server,
    //     path: "/ws"
    // })
    // wsServer = wss
    // await new Promise<void>(resolve => {
    //     wss.once("listening", resolve)
    // })
}

export const addFileToSend = (filePath: string) => {
    sendingFiles.set(++lastSendingId, filePath)
    // TODO
    typedIpcMain.sendToWindow(mainWindow, 'updateSendingFiles', { ids: [lastSendingId] })
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

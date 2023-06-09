import { BrowserWindow, app } from 'electron';
import electronIsDev from "electron-is-dev";
import { getFileFromPublic } from "@zardoy/electron-esbuild/build/client"
import http from "http"
import { Server, WebSocket, WebSocketServer } from "ws"
import serveHandler from "serve-handler"
import { join } from 'path'

export let mainWindow: BrowserWindow | null;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 700,
        height: 400,
        minWidth: 800,
        minHeight: 600,
        center: true,
        backgroundColor: "#000",
        darkTheme: true,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false
        },
        title: app.getName()
    })
    mainWindow.loadURL('url')
    mainWindow.on("close", () => {
        app.quit()
    })
    mainWindow.on("closed", () => mainWindow = null);
    mainWindow.setMenu(null);
    void mainWindow.loadURL(electronIsDev ? "http://localhost:3500" : `file:///${getFileFromPublic("index.html")}`);
})

const startServer = async () => {
    const server = http.createServer((req, res) => {
        return serveHandler(req, res, {
            public: electronIsDev ? join(__dirname, "../../dist-remote-ui") : getFileFromUnpacked("dist-remote-ui"),
            rewrites: [{
                source: "/",
                destination: "/index.html",
            }],
            headers: [
                {
                    "source": "**/*.@(html|css|js|png|jpg)",
                    "headers": [{
                        "key": "Cache-Control",
                        "value": "max-age=7200"
                    }]
                }
            ]
        })
    })
    const remoteHttpPort = 8080
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

startServer()

const getFileFromUnpacked = (path: string,) => {
    return join(__dirname, "../../app.asar.unpacked/", path)
}

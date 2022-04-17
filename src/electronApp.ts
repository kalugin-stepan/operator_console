import { app, BrowserWindow, globalShortcut } from 'electron'

class ElectronApp {
    private win: BrowserWindow
    private readonly MAIN_WINDOW_WEBPACK_ENTRY: string
    private readonly MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

    constructor(MAIN_WINDOW_WEBPACK_ENTRY: string, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string) {
        this.MAIN_WINDOW_WEBPACK_ENTRY = MAIN_WINDOW_WEBPACK_ENTRY
        this.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY = MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY

        if (require('electron-squirrel-startup')) {
            app.quit()
        }

        this.events()
    }

    send(channel: string, ...args: any[]) {
        this.win.webContents.send(channel, ...args)
    }

    onShortcut(shortcut: string, handler: () => void) {
        app.whenReady().then(() => {
            globalShortcut.register(shortcut, handler)
        })
    }

    private createWindow() {
        this.win = new BrowserWindow({
            height: 600,
            width: 800,
            webPreferences: {
                preload: this.MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
                nodeIntegration: true,
                contextIsolation: false
            }
        })

        this.win.removeMenu()

        this.win.loadURL(this.MAIN_WINDOW_WEBPACK_ENTRY)

        this.win.webContents.openDevTools()
    }

    private events() {
        app.on('ready', this.createWindow.bind(this))

        app.on('window-all-closed', () => {
            if (process.platform !== 'darwin') {
                app.quit()
            }
        })

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                this.createWindow()
            }
        })
    }
}

export default ElectronApp
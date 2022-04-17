import electron, { ipcMain } from 'electron'
import ElectronApp from './electronApp'
import path from 'path'
import fs from 'fs'
import mqtt, { Client, MqttClient } from 'mqtt'
import { v4 as uuid } from 'uuid'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const app = new ElectronApp(MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)

const root = electron.app.getAppPath()

const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf-8'))

const settings = fs.readFileSync(path.join(root, 'settings.json'), 'utf-8')

const mqtt_clients: Map<string, MqttClient | undefined> = new Map()

ipcMain.on('joystick_move', (e, id: string, data: string) => {
    const client = mqtt_clients.get(id)
    if (client === undefined) return
    client.publish(id, data)
})

ipcMain.handle('settings', () => {
    return settings
})

interface User {
    id: string
    username: string
    password: string
}

ipcMain.on('connect', (e, data) => {
    const user: User = JSON.parse(data)
    user.id = uuid()
    fs.writeFileSync('data.txt', user.id)
    const client = mqtt.connect(
        `mqtt://${config.mqtt_host}:${config.mqtt_port}`
    )
    mqtt_clients.set(user.id, client)

    client.subscribe(user.id)

    client.on('message', (topic, data, pack) => {
        app.send('pos', user.id, data.toString('utf-8'))
    })

    client.on('connect', () => {
        app.send('connection_response', user.id)
    })

    function on_disconnect() {
        app.send('connection_response', '')
        client.end()
        mqtt_clients.delete(user.id)
    }

    client.on('error', on_disconnect)
    client.on('disconnect', on_disconnect)
    client.on('close', on_disconnect)
})

for (let i = 0; i <= 9; i++) {
    app.onShortcut(`ctrl+${i}`, () => {
        app.send('switched', i)
    })
}
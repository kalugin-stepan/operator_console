import electron, { ipcMain } from 'electron'
import ElectronApp from './electronApp'
import path from 'path'
import fs from 'fs'
import mqtt, { MqttClient } from 'mqtt'
import fetch, { Response } from 'node-fetch'

declare const MAIN_WINDOW_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string

const app = new ElectronApp(MAIN_WINDOW_WEBPACK_ENTRY, MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY)

const root = electron.app.getAppPath()

const config = JSON.parse(fs.readFileSync(path.join(root, 'config.json'), 'utf-8'))

const settings = JSON.parse(fs.readFileSync(path.join(root, 'settings.json'), 'utf-8'))

let client: MqttClient | null = null

ipcMain.handle('settings', () => {
    return settings
})

let players: Player[] = []

function updatePlayers(new_players: Player[]) {
    players.forEach(player => {
        client.unsubscribe(`${player.id}/${player.robot_name}`)
    })
    players = new_players
    players.forEach(player => {
        client.subscribe(`${player.id}/${player.robot_name}`)
    })
}

interface Player {
    id: number
    robot_name: string
}

ipcMain.on('login', async (e, user: {username: string, password: string}) => {

    const fetchData = new URLSearchParams()

    fetchData.append('username', user.username)
    fetchData.append('password', user.password)

    let res: Response | undefined = undefined

    try {
        res = await fetch(`${config.api_origin}/api/login`, {method: 'POST', body: fetchData})
    } catch {}

    if (!res) {
        app.send('login_responce', 'API server is not available.')
        return
    }

    if (!res.ok) {
        app.send('login_responce', 'invalid username or password.')
        return
    }

    app.send('login_responce', parseInt(await res.text()))

    // app.send('login_responce', Math.round(Math.random() * 100))

    client = mqtt.connect(`mqtt://${config.mqtt_host}:${config.mqtt_port}`)

    client.on('message', (topic, data) => {
        try {
            const [player_id, robot_name] = topic.split('/')
            app.send('pos', parseInt(player_id), robot_name, data.toString('utf-8'))
        } catch {}
    })
})

ipcMain.on('register', async (e, username: string, password: string) => {
    const fetchData = new URLSearchParams()

    fetchData.append('username', username)
    fetchData.append('password', password)

    let res: Response | undefined = undefined

    try {
        res = await fetch(`${config.api_origin}/api/register`, {method: 'POST', body: fetchData})
    } catch {}

    if (!res) {
        app.send('register_responce', 'API server is not available.')
        return
    }

    app.send('register_responce', !res.ok ? await res.text() : '')
})

ipcMain.on('logout', (e) => {
    client.end()
    client = null
    players = []
})

ipcMain.on('vel_changed', (e, data: string) => {
    client.publish('vel', data)
})

ipcMain.on('players', (e, players: Player[]) => {
    updatePlayers(players)
})

for (let i = 0; i <= 9; i++) {
    app.onShortcut(`ctrl+${i}`, () => {
        app.send('switched', i)
    })
}
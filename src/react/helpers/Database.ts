import ipcRenderer from './ipcRenderer'
import User from '../models/User'

export default class DataBase {
    private static _users: User[] = []
    static get users(): User[] {
        return this._users
    }
    static async AddUser(user: User): Promise<string> {
        const p = new Promise<string>((res, rej) => {
            ipcRenderer.once('connection_response', (e, id: string) => {
                if (id !== '') {
                    user.id = id
                    this._users.push(user)
                }
                res(id)
            })
        })
        await ipcRenderer.send('connect', JSON.stringify(user))
        return p
    }
    static async DeleteUser(user: User) {
        let i: number = -1
        await ipcRenderer.send('disconnectd', JSON.stringify(user))
        this._users = this._users.filter((u, j) => {
            u.username !== user.username
            i = j
        })
        return i
    }
}
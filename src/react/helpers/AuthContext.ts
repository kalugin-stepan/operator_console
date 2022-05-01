import ipcRenderer from "./ipcRenderer"

class AuthContext {
    static id: number | null = null
    static username: string | null = null
    static password: string | null = null
    static async Login(username: string, password: string): Promise<number | string> {
        ipcRenderer.send('login', {username, password})
        return new Promise<number | string>((res, rej) => {
            ipcRenderer.once('login_responce', (e, id: number | string) => {
                if (typeof id !== 'string') {
                    this.id = id
                    this.username = username
                    this.password = password
                }
                res(id)
            })
        })
    }
    static async Register(username: string, password: string): Promise<string> {
        ipcRenderer.send('register', username, password)
        return new Promise<string>((res, rej) => {
            ipcRenderer.once('register_responce', (e, data) => {
                res(data)
            })
        })
    }
    static Logout() {
        this.id = null
        this.username = null
        this.password = null
        ipcRenderer.send('logout')
    }
}

export default AuthContext
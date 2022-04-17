import ipcRenderer from "../helpers/ipcRenderer"

class User {
    id: string
    readonly username: string
    readonly password: string
    constructor(username: string, password: string) {
        this.username = username
        this.password = password
    }
}

export default User
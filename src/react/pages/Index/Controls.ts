class Controls {
    private readonly commands = new Map<string, {down: () => void, up: () => void}>();
    private stack: string[] = []
    constructor() {
        document.body.onkeydown = this.onKeyDown.bind(this)
        document.body.onkeyup = this.onKeyUp.bind(this)
    }

    on(key: string, down: () => void, up: () => void) {
        this.commands.set(key, {down, up})
    }

    private onKeyDown(e: KeyboardEvent) {
        if (this.stack.includes(e.key)) return
        const cmd = this.commands.get(e.key)
        if (cmd === undefined) return
        cmd.down()
        this.stack.push(e.key)
    }

    private onKeyUp(e: KeyboardEvent) {
        const cmd = this.commands.get(e.key)
        if (cmd === undefined) return
        cmd.up()
        this.stack = this.stack.filter(key => key !== e.key)
    }

    stop() {
        document.body.removeEventListener('keydown', this.onKeyDown.bind(this))
        document.body.removeEventListener('keyup', this.onKeyUp.bind(this))
    }
}

export default Controls
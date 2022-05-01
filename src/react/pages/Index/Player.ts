import Vector from './Vector'

class Player {
    readonly robot_name: string
    readonly id: number
    pos: Vector
    constructor(id: number, pos: Vector, robot_name: string) {
        this.id = id
        this.robot_name = robot_name
        this.pos = pos
    }
}

export default Player
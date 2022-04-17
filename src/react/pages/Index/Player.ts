import User from '../../models/User'
import Vector from '../../models/Vector'

class Player {
    readonly user: User
    pos: Vector
    constructor(user: User, pos: Vector) {
        this.user = user
        this.pos = pos
    }
}

export default Player
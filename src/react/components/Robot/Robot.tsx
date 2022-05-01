import Vector from '../../pages/Index/Vector'
import './Robot.css'

enum Team {
    blue,
    orange
}

export default function Robot(props: {size: number, team: Team, pos: Vector, k?: number}) {
    const colorClass = props.team === Team.blue ? 'blue' : 'orange'
    return (
        <div className={`robot ${colorClass}`}
        style={{
            width: props.size,
            height: props.size,
            left: props.k === undefined ? props.pos.x : props.pos.x*props.k,
            top: props.k === undefined ? props.pos.y : props.pos.y*props.k}}>
            
        </div>
    )
}

export { Team }
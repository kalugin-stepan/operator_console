import { ReactNode } from 'react'
import './FootballField.css'

const hdw = 336/474

export default function FootballField(props: {width: number, children?: ReactNode}) {
    return (
        <div className='football_field' style={{width: props.width, height: props.width*hdw}}>
            {
                props.children
            }
        </div>
    )
}
import { MutableRefObject, CSSProperties } from 'react'
import './Alert.css'

export default function Alert(props: {text: string, button_text: string,
    on_button_click: () => void, ref?: MutableRefObject<HTMLDivElement>,
    style?: CSSProperties}) {
    return (
        <div className='alert' ref={props.ref} style={props.style}>
            <p>{props.text}</p>
            <button type='button' onClick={props.on_button_click}>{props.button_text}</button>
        </div>
    )
}
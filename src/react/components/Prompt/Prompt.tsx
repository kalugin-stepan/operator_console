import { useRef, ReactNode } from 'react'
import './Prompt.css'

export default function Prompt(props: {text: string, placeholder_text?: string,
    button_text: string, on_button_click: (data: string) => void}) {
    const value = useRef<HTMLInputElement>()

    return (
        <div className='prompt'>
            <p>{props.text}</p>
            <input ref={value} placeholder={props.placeholder_text}/>
            <button type='button' onClick={() => props.on_button_click(value.current.value)}>{props.button_text}</button>
        </div>
    )
}
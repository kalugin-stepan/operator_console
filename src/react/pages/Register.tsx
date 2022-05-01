import { useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthContext from '../helpers/AuthContext'
import '../css/Form.css'
import Alert from '../components/Alert/Alert'

export default function Register() {
    const [isRegistered, setIsRegistered] = useState<boolean>(false)
    const username = useRef<HTMLInputElement>()
    const password = useRef<HTMLInputElement>()

    const [errorMessage, setErrorMessage] = useState<string>('')

    async function doRegister() {
        const rez = await AuthContext.Register(username.current.value, password.current.value)
        if (rez === '') {
            setIsRegistered(true)
            return
        }
        console.error(rez)
        password.current.value = ''
    }

    return (
        <form className='form'>
            {errorMessage !== '' ?
            <Alert text={errorMessage} button_text='ok' on_button_click={() => setErrorMessage('')}/>
            : ''}
            <div>
                <h1>Register</h1>
            </div>
            <hr className='form__hr'/>
            <div>
                <input className='form__input' placeholder='Username' ref={username}/>
            </div>
            <div>
                <input className='form__input' placeholder='Password' type='password' ref={password}/>
            </div>
            <div>
                <button className='form__button' onClick={doRegister}>Register</button>
            </div>
            {isRegistered ? <Navigate replace to='/'/> : ''}
            <Link replace to='/login'>Login</Link>
        </form>
    )
}
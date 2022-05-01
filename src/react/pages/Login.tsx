import { useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import AuthContext from '../helpers/AuthContext'
import Alert from '../components/Alert/Alert'
import '../css/Form.css'

export default function Login() {
    const [isLogin, setIsLogin] = useState<boolean>(false)
    const username = useRef<HTMLInputElement>()
    const password = useRef<HTMLInputElement>()
    const [errorMessage, setErrorMessage] = useState<string>('')

    useEffect(() => {
        document
    })

    async function doLogin() {
        const rez = await AuthContext.Login(username.current.value, password.current.value)
        if (typeof rez !== 'string') {
            setIsLogin(true)
            return
        }
        setErrorMessage(rez)
        password.current.value = ''
    }

    return (
        <form className='form'>
            {errorMessage !== '' ? <Alert text={errorMessage} button_text='ok' on_button_click={() => setErrorMessage('')}/> : ''}
            <div>
                <h1>Login</h1>
            </div>
            <hr className='form__hr'/>
            <div>
                <input className='form__input' placeholder='Username' ref={username}/>
            </div>
            <div>
                <input className='form__input' placeholder='Password' type='password' ref={password}/>
            </div>
            <div>
                <button type='button' className='form__button' onClick={doLogin}>Login</button>
            </div>
            {isLogin ? <Navigate replace to='/'/> : ''}
            <Link replace to='/register'>Register</Link>
        </form>
    )
}
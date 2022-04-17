import { useRef, useState } from 'react'
import { Navigate } from 'react-router-dom'
import DataBase from '../../helpers/Database'
import User from '../../models/User'
import './Login.css'

export default function Login() {
    const username = useRef<HTMLInputElement>()
    const password = useRef<HTMLInputElement>()
    const [isLogin, setIsLogin] = useState<boolean>(false)

    async function doLogin() {
        const rez = await DataBase.AddUser(new User(username.current.value, password.current.value))
        if (rez !== '') {
            setIsLogin(true)
            return
        }
        alert('Login failure')
    }

    return (
        <form className='login_form'>
            <div>
                <h1>Login</h1>
            </div>
            <hr/>
            <div>
                <input placeholder='Username' ref={username}/>
            </div>
            <div>
                <input placeholder='Password' type='password' ref={password}/>
            </div>
            <div>
                <button type='button' onClick={doLogin}>Login</button>
            </div>
            {isLogin ? <Navigate replace to='/'/> : ''}
        </form>
    )
}
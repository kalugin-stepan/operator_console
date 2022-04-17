import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Index from './pages/Index/Index';
import Login from './pages/Login/Login'

export default function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<Index/>}/>
                <Route path='/login' element={<Login/>}/>
            </Routes>
        </Router>
    )
}
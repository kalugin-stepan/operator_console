import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'
import Index from './pages/Index/Index';
import Login from './pages/Login'
import Register from './pages/Register';

export default function App() {

    return (
        <Router>
            <Routes>
                <Route path='/' element={<Index/>}/>
                <Route path='/login' element={<Login/>}/>
                <Route path='/register' element={<Register/>}/>
            </Routes>
        </Router>
    )
}
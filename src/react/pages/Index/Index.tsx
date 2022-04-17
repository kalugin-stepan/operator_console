import { ReactNode, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Robot, { Team } from '../../components/Robot/Robot'
import FootballField from '../../components/FootballField/FootballField'
import DataBase from '../../helpers/Database'
import ipcRenderer from '../../helpers/ipcRenderer'
import Settings, { Bindings } from '../../models/Settings'
import User from '../../models/User'
import Player from './Player'
import Vector from '../../models/Vector'
import Controls from './Controls'
import './Index.css'

async function getSettings() {
    const settigns: Settings = JSON.parse(await ipcRenderer.invoke('settings'))
    return settigns
}

function getFieldWidth() {
    return document.body.offsetWidth*0.7
}

const primeryPos: Vector = {x: 0, y: 0}
const secondaryPos: Vector = {x: 0, y: 0}

function applySettings(controls: Controls, settings: Settings,
    notifyPrimaryPosUpdate: () => void, notifySecondaryPosUpdate: () => void) {

    function pushControls(bindings: Bindings, pos: Vector, notify: () => void) {

        function onYUp() {
            pos.y = 0
            notify()
        }

        function onXUp() {
            pos.x = 0
            notify()
        }

        controls.on(bindings.forwardKey, () => {
            pos.y = 100
            notify()
        }, onYUp)
        controls.on(bindings.backKey, () => {
            pos.y = -100
            notify()
        }, onYUp)
        controls.on(bindings.leftKey, () => {
            pos.x = -100
            notify()
        }, onXUp)
        controls.on(bindings.rightKey, () => {
            pos.x = 100
            notify()
        }, onXUp)
    }

    pushControls(settings.primaryBindings, primeryPos, notifyPrimaryPosUpdate)
    pushControls(settings.secondaryBindings, secondaryPos, notifySecondaryPosUpdate)
}

export default function Index() {

    const [users, setUsers] = useState<User[]>(DataBase.users)
    const [primaryUser, setPrimaryUser] = useState<User | undefined>(DataBase.users[0])
    const [secondaryUser, setSecondaryUser] = useState<User | undefined>(DataBase.users[1])

    const [players, setPlayers] = useState<Player[]>(DataBase.users.map(user => new Player(user, {x: 0, y: 0})))

    const [settings, setSettings] = useState<Settings>({
        primaryBindings: {
            forwardKey: '',
            backKey: '',
            leftKey: '',
            rightKey: ''
        },
        secondaryBindings: {
            forwardKey: '',
            backKey: '',
            leftKey: '',
            rightKey: ''
        }
    })

    const [fieldWidth, setFieldWidth] = useState<number>(getFieldWidth())

    const k = fieldWidth/272

    function setCurrentUsers(i: number) {
        while (i >= DataBase.users.length) {
            i--
        }
        setPrimaryUser(DataBase.users[i])
        let j = i + 1;
        if (j > DataBase.users.length) {
            setSecondaryUser(DataBase.users[j])
            return
        }
        j = i - 1;
        if (j >= 0) {
            setSecondaryUser(DataBase.users[j])
            return
        }
        setSecondaryUser(undefined)
    }

    useEffect(() => {

        getSettings().then(settings => {
            setSettings(settings)
        })

        ipcRenderer.on('pos', (e, id: string, data: string) => {
            console.log(id)
            console.log(data)
            const pos: Vector = JSON.parse(data)

            for (const player of players) {
                if (player.user.id === id) {
                    player.pos = pos
                    setPlayers(players.map(player => player))
                    console.log('y')
                    return
                }
            }
        })

        ipcRenderer.on('switched', (e, i) => {
            if (i == 0) {
                setPrimaryUser(DataBase.users[9])
                return
            }
            if (DataBase.users.length < i) return
            setPrimaryUser(DataBase.users[i - 1])
        })

        function onWindowResize() {
            setFieldWidth(getFieldWidth())
        }

        document.body.onresize = onWindowResize

        return () => {
            ipcRenderer.removeAllListeners('switched')
            document.body.removeEventListener('resize', onWindowResize)
        }
    }, [])

    useEffect(() => {
        const controls = new Controls()

        function onPrimaryPosChanged() {
            ipcRenderer.send('joystick_move', primaryUser.id, JSON.stringify(primeryPos))
        }

        function onSecondaryPosChanged() {
            if (secondaryUser === undefined) return
            ipcRenderer.send('joystick_move', secondaryUser.id, JSON.stringify(secondaryPos))
        }

        applySettings(controls, settings, onPrimaryPosChanged, onSecondaryPosChanged)
        return () => {
            controls.stop()
        }
    }, [settings, primaryUser])

    async function doLogout() {
        const i = await DataBase.DeleteUser(primaryUser)
        setUsers(DataBase.users)
        setCurrentUsers(i)
    }

    users.forEach(user => {
        console.log(user.id)
    })

    return (
        <div>
            <header className='header'>
                <div className='users' style={{width: fieldWidth > 600 ? fieldWidth : 'auto'}}>
                    {
                        users.map<ReactNode>((u, i) => {
                            const className = u.username === primaryUser.username ? 'selected' : ''

                            return <button className={className} key={i} onClick={() => setCurrentUsers(i)}>{u.username}</button>
                        })
                    }
                </div>
            </header>
            <FootballField width={fieldWidth}>
                {
                    players.map(player => 
                        <Robot key={player.user.id} size={fieldWidth/20} team={Team.blue} pos={player.pos} k={k}/>
                    )
                }
            </FootballField>
            <div className='bottom_menu'>
                <Link to='/login'>Login</Link>
                <button onClick={doLogout}>Logout</button>
            </div>
            {users.length === 0 ? <Navigate replace to='/login'/> : ''}
        </div>
    )
}
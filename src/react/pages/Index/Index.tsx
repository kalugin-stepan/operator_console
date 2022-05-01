import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import Robot, { Team } from '../../components/Robot/Robot'
import FootballField from '../../components/FootballField/FootballField'
import ipcRenderer from '../../helpers/ipcRenderer'
import Settings, { Bindings } from '../../models/Settings'
import Player from './Player'
import Vector from './Vector'
import Controls from './Controls'
import AuthContext from '../../helpers/AuthContext'
import Prompt from '../../components/Prompt/Prompt'
import './Index.css'

function getFieldWidth() {
    return document.body.offsetWidth*0.6
}

function applySettings(controls: Controls, settings: Settings,
    notifyPrimaryPosUpdate: (pos: Vector) => void, notifySecondaryPosUpdate: (pos: Vector) => void) {

    const primeryVel: Vector = {x: 0, y: 0}
    const secondaryVel: Vector = {x: 0, y: 0}

    function pushControls(bindings: Bindings, vel: Vector, notify: (vel: Vector) => void) {

        function onYUp() {
            vel.y = 0
            notify(vel)
        }

        function onXUp() {
            vel.x = 0
            notify(vel)
        }

        controls.on(bindings.forwardKey, () => {
            vel.y = 100
            notify(vel)
        }, onYUp)
        controls.on(bindings.backKey, () => {
            vel.y = -100
            notify(vel)
        }, onYUp)
        controls.on(bindings.leftKey, () => {
            vel.x = -100
            notify(vel)
        }, onXUp)
        controls.on(bindings.rightKey, () => {
            vel.x = 100
            notify(vel)
        }, onXUp)
    }

    pushControls(settings.primaryBindings, primeryVel, notifyPrimaryPosUpdate)
    pushControls(settings.secondaryBindings, secondaryVel, notifySecondaryPosUpdate)
}

let last_player_lenght = 0

export default function Index() {
    const [players, setPlayers] = useState<Player[]>([])
    const [ownedPlayers, setOwnedPlayers] = useState<Player[]>([])
    const [ownedPlayerIndex, setOwnedPlayerIndex] = useState<number>(0)

    const [isAddingPlayer, setIsAddingPlayer] = useState<boolean>(false)

    const primaryOwnedPlayer = ownedPlayers.length > ownedPlayerIndex ? ownedPlayers[ownedPlayerIndex] : undefined
    const secondaryOwnedPlayer = ownedPlayers.length > ownedPlayerIndex + 1 ? ownedPlayers[ownedPlayerIndex + 1] : 
    ownedPlayerIndex - 1 >= 0 ? ownedPlayers[ownedPlayerIndex - 1] : undefined

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

    useEffect(() => {
        function onResize(){
            setFieldWidth(getFieldWidth())
        }

        document.body.onresize = onResize

        ipcRenderer.invoke('settings').then(settings => {
            setSettings(settings)
        })

        return () => {
            document.body.removeEventListener('resize', onResize)
        }
    }, [])

    useEffect(() => {
        ipcRenderer.on('pos', (e, player_id: number, robot_name: string, data: string) => {
            const pos: Vector = JSON.parse(data)
            console.log(player_id)
            console.log(robot_name)
            for (const player of players) {
                console.log(player)
                if (player.id === player_id && player.robot_name === robot_name) {
                    player.pos = pos
                    break
                }
            }
            setPlayers([...players])
        })

        if (players.length !== last_player_lenght) {
            last_player_lenght = players.length
            ipcRenderer.send('players', players.map<{id: number, robot_name: string}>(player => {
                return {id: player.id, robot_name: player.robot_name}
            }))
        }

        return () => {ipcRenderer.removeAllListeners('pos')}
    }, [players])

    useEffect(() => {
        const controls = new Controls()

        function onPrimaryPosUpdate(pos: Vector) {
            if (primaryOwnedPlayer === undefined) return
            ipcRenderer.send(
                'vel_changed',
                JSON.stringify({id: AuthContext.id, robot_name: primaryOwnedPlayer.robot_name, pos})
            )
        }

        function onSecondaryPosUpdate(pos: Vector) {
            if (secondaryOwnedPlayer === undefined) return
            ipcRenderer.send(
                'vel_changed',
                JSON.stringify({id: AuthContext.id, robot_name: secondaryOwnedPlayer.robot_name, pos})
            )
        }

        applySettings(controls, settings, onPrimaryPosUpdate, onSecondaryPosUpdate)
        return () => {controls.stop()}
    }, [settings, ownedPlayerIndex, ownedPlayers])

    const k = fieldWidth/272

    const addRobot = useCallback((robotName: string) => {
        setIsAddingPlayer(false)
        if (robotName === '') return
        const player = new Player(AuthContext.id, {x: 0, y: 0}, robotName)
        setOwnedPlayers([...ownedPlayers, player])
        setPlayers([...players, player])
    }, [players, ownedPlayers])

    const doLogout = useCallback(() => {
        AuthContext.Logout()
        setOwnedPlayers([])
    }, [])

    return (
        <div>
            {isAddingPlayer ? <Prompt text='Input robot name.' button_text='Add'
            placeholder_text='Robot name' on_button_click={robotName => addRobot(robotName)}/> : ''}
            <header className='header'>
                <div className='users' style={{width: fieldWidth > 600 ? fieldWidth : 'auto'}}>
                    {
                        ownedPlayers.map<ReactNode>((player, i) => {
                            const className = player === primaryOwnedPlayer ? 'selected' : ''

                            return (
                                <button className={className}
                                key={player.robot_name}
                                onClick={() => setOwnedPlayerIndex(i)}>{player.robot_name}</button>
                            )
                        })
                    }
                </div>
            </header>
            <FootballField width={fieldWidth}>
                {
                    players.map(player =>
                        <Robot key={player.robot_name} size={fieldWidth/20} team={Team.blue} pos={player.pos} k={k}/>
                    )
                }
            </FootballField>
            <div className='bottom_menu'>
                <button onClick={() => setIsAddingPlayer(true)}>Add player</button>
                <Link to='/login'>Login</Link>
                <button onClick={doLogout}>Logout</button>
            </div>
            {AuthContext.id === null ? <Navigate replace to='/login'/> : ''}
        </div>
    )
}
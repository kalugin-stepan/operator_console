const mqtt = require('mqtt')
const stdio = require('stdio')

const client = mqtt.connect('mqtt://broker.hivemq.com:1883')

client.subscribe('vel')

client.on('connect', () => {
    console.log('conn')
})

client.on('message', (topic, data, pack) => {
    console.log(data.toString('utf-8'))
})

async function test() {
    const topic = await stdio.readLine()
    const pos = {x: 100, y: 100}
    const i = setInterval(() => {
        if (pos.x == 0) {
            clearInterval(i)
        }
        client.publish(topic, JSON.stringify(pos))
        pos.x--
        pos.y--
    }, 5)
}

test()

// async function sendLoop() {
//     while (true) {
//         const topic = await stdio.readLine()
//         const x = parseInt(await stdio.readLine())
//         const y = parseInt(await stdio.readLine())
//         client.publish(topic, JSON.stringify({x, y}))
//     }
// }

// sendLoop()
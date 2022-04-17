const mqtt = require('mqtt')
const stdio = require('stdio')

const client = mqtt.connect('mqtt://localhost:1883')

client.subscribe('#')

client.on('connect', () => {
    console.log('conn')
})

client.on('message', (topic, data, pack) => {
    console.log(`${topic}: ${data.toString('utf-8')}`)
})

async function sendLoop() {
    while (true) {
        const id = await stdio.readLine()
        const pos = await stdio.readLine()
        client.publish(id, pos)
    }
}

sendLoop()
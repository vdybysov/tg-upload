process.env["NTBA_FIX_350"] = 1
process.env["NTBA_FIX_319"] = 1

const path = require('path')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const config = require('./config.json')

const getArg = name => process.argv.map(arg => arg.split(`--${name}=`)[1]).find(val => !!val)

const { token } = config
const op = getArg('op')

switch (op) {
    case 'listen':
        listen()
        break
    case 'upload':
        const chatId = getArg('chat')
        if (!chatId) {
            console.error(`No chat id.`)
            return
        }
        const filePath = getArg('file')
        if (!filePath) {
            console.error(`No file path.`)
            return
        }
        fs.promises.stat(filePath)
            .then(() => {
                try {
                    upload(chatId, filePath)
                } catch(err) {
                    console.error(err)
                }
            })
            .catch(() => console.error(`${path.resolve(filePath)} does not exist.`))
        break
    default:
        console.error(`Unkwnown op type: ${op}`)
}

function listen() {
    console.log('Waiting for messages...')
    new TelegramBot(token, { polling: true })
        .on('message', msg => console.log(`Received message from ${msg.chat.id}`))
}

function upload(chatId, filePath) {
    new TelegramBot(token)
        .sendDocument(chatId, filePath)
        .then(() => console.log(`${path.resolve(filePath)} sent.`))
}
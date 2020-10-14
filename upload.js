process.env["NTBA_FIX_350"] = 1
process.env["NTBA_FIX_319"] = 1

const path = require('path')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')
const config = require('./config.json')

const getArg = name => process.argv.map(arg => arg.split(`--${name}=`)[1]).find(val => !!val)

const { token } = config

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

function upload(chatId, filePath) {
    new TelegramBot(token)
        .sendDocument(chatId, filePath)
        .then(() => console.log(`${path.resolve(filePath)} sent.`))
}
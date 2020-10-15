process.env["NTBA_FIX_350"] = 1
process.env["NTBA_FIX_319"] = 1

const fs = require('fs')
const path = require('path')
const TelegramBot = require('node-telegram-bot-api')
const config = require('./config.json')

const getArg = name => process.argv.map(arg => arg.split(`--${name}=`)[1]).find(val => !!val)

const { token } = config

const chatId = +getArg('chat')
if (!chatId) {
    console.error(`No chat id.`)
    return
}

const file = getArg('file')

function waitAndDownload() {
    const bot = new TelegramBot(token, { polling: true })
    const waitOn = Date.now()
    console.log('Send any file to your bot...')
    bot.on('message', async msg => {
        if(!msg.document || msg.chat.id !== chatId || msg.date * 1000 < waitOn) {
            return
        }
        const rs = bot.getFileStream(msg.document.file_id)
        const filePath = path.resolve(process.cwd(), file || msg.document.file_name)
        const ws = fs.createWriteStream(filePath)
        rs.pipe(ws)
        ws.on('close', () => {
            console.log(`Downloaded to ${filePath}`)
            process.exit()
        })
    })
}

waitAndDownload()
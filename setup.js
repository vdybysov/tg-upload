process.env["NTBA_FIX_350"] = 1
process.env["NTBA_FIX_319"] = 1

const BASHRC = '~/.bashrc'
const BASHRC_COMMENT = '# Added by tgft, do not touch'

const readline = require('readline')
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})
const chalk = require('chalk')
const fs = require('fs')
const TelegramBot = require('node-telegram-bot-api')

const askForToken = () => new Promise(resolve => {
    rl.question('1. Type your bot token: ', async token => {
        const bot = new TelegramBot(token, { polling: true })
        try {
            await bot.getMe()
            resolve(bot)
        } catch (err) {
            bot.stopPolling()
            console.log('Could not create bot. Wrong token?')
            askForToken().then(resolve)
        }
    })
})

const waitForChat = bot => new Promise(resolve => {
    console.log('2. Send any message to your bot to let him remember your account for file transfer...')
    bot.on('message', msg => {
        console.log(`Success! Chat ID is ${chalk.bold(msg.chat.id)}`)
        resolve(msg.chat.id)
    })
})

const saveConfig = token => new Promise(resolve => {
    fs.writeFile(`${__dirname}/config.json`, JSON.stringify({
        token
    }, null, 2), err => {
        if (err) {
            console.log('Could not save config: ', err)
        } else {
            resolve()
        }
    })
})

const createAliases = chatId => new Promise(resolve => {
    console.log('3. Creating aliases...')
    fs.readFile(BASHRC, (err, content) => {
        if (err) {
            console.log(`Could not read ${BASHRC}`)
            return
        }
        if (content.indexOf(BASHRC_COMMENT) !== -1) {
            const spl = content.split(BASHRC_COMMENT)
            content = spl[0].concat(spl[1].split('}')[2])
        }
        content += `

            # Added by tgft, do not touch
            function tgup() {
                node ${__dirname}/upload.js --chat=${chatId} --file=$1
            }
            function tgdl() {
                node ${__dirname}/download.js --chat=${chatId}
            }
        `
        fs.writeFile(BASHRC_COMMENT, content, err => {
            if (err) {
                console.log(`Could not write ${BASHRC}`)
            } else {
                console.log(`Well done! Open new terminal and run\n${chalk.bold('tgup <file>')}\nto upload and\t${chalk.bold('tgdl')}\nto download.`)
            }
        })
    })
})

askForToken()
    .then(waitForChat)
    .then(saveConfig)
    .then(createAliases)
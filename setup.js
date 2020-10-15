process.env["NTBA_FIX_350"] = 1
process.env["NTBA_FIX_319"] = 1

const BASHRC = `${require('os').homedir()}/.bashrc`
const BASHRC_COMMENT = '\n# Added by tgft, do not touch'

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
        const bot = new TelegramBot(token)
        try {
            await bot.getMe()
            resolve({token, bot})
        } catch (err) {
            bot.stopPolling()
            console.log('Could not create bot. Wrong token?')
            askForToken().then(resolve)
        }
    })
})

const waitForChat = bot => new Promise(resolve => {
    bot.startPolling()
    const code = 1000 + Math.floor(Math.random() * 8999)
    console.log(`2. Send '${code}' to your bot to let him remember your account for file transfer...`)
    let chatId
    bot.onText(new RegExp(code), msg => {
        chatId = msg.chat.id
        console.log(`Success! Chat ID is ${chalk.bold(chatId)}`)
        resolve(chatId)
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
    fs.readFile(BASHRC, 'utf8', (err, content) => {
        if (err) {
            resolve()
            console.log(`Could not read ${BASHRC}`)
            return
        }
        if (content.indexOf(BASHRC_COMMENT) !== -1) {
            const spl = content.split(BASHRC_COMMENT)
            content = spl[0].concat(spl[1].split('}\n')[2])
        }
        content += `${BASHRC_COMMENT}
function tgup() {
    node ${__dirname}/upload.js --chat=${chatId} --file=$1
}
function tgdl() {
    node ${__dirname}/download.js --chat=${chatId} --file=$1
}
        `
        fs.writeFile(BASHRC, content, err => {
            if (err) {
                console.log(`Could not write ${BASHRC}`)
            } else {
                console.log(`Well done! Open new terminal and run\n${chalk.bold('tgup <file>')}\nto upload and\n${chalk.bold('tgdl [file]')}\nto download.`)
            }
            resolve()
        })
    })
})

askForToken()
    .then(async ({token, bot}) => {
        await saveConfig(token)
        return await waitForChat(bot)
    })
    .then(createAliases)
    .then(() => process.exit())
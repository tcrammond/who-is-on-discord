require('dotenv').config();
const http = require('http');

const Discord = require('discord.js');
const discord = new Discord.Client();

const TelegramBot = require('node-telegram-bot-api');
const telegram = new TelegramBot(process.env.TELEGRAM_TOKEN);

const channelId = Math.sign(process.env.TELEGRAM_CHANNEL_ID) === 1 ? -process.env.TELEGRAM_CHANNEL_ID : process.env.TELEGRAM_CHANNEL_ID;

let throttle = null;

const queue = {
    join: new Set(),
    leave: new Set()
};

discord.on('voiceStateUpdate', (oldMember, newMember) => {
    const newUserChannel = newMember.voiceChannel;
    const oldUserChannel = oldMember.voiceChannel;
    const userName = newMember.user.username;

    if(typeof oldUserChannel === 'undefined' && typeof newUserChannel !== 'undefined') {
        console.log('user joined');
        queue.join.add(userName);
        clearTimeout(throttle);
        throttle = setTimeout(sendBatchMessage, 30000);
    } else if (typeof newUserChannel === 'undefined') {
        console.log('user left');
        queue.leave.add(userName);
        clearTimeout(throttle);
        throttle = setTimeout(sendBatchMessage, 30000);
    }
});

const sendBatchMessage = () => {
    const joinMessage = queue.join.length ? `${queue.join.join(', ')} ${queue.join.length === 1 ? 'has' : 'have'} joined` : '';
    const leaveMessage = queue.leave.length ? `${queue.leave.join(', ')} ${queue.leave.length === 1 ? 'has' : 'have'} left` : '';
    const message = [joinMessage, leaveMessage].join('; ');
    queue.join.clear();
    queue.leave.clear();
    telegram.sendMessage(channelId, message)
};

discord.login(process.env.DISCORD_TOKEN);

http.createServer((req, res) => {}).listen(process.env.PORT);
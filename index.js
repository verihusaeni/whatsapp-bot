const { default: makeWASocket, useSingleFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys')
const pino = require('pino')
const axios = require('axios')
const fs = require('fs')

const { state, saveState } = useSingleFileAuthState('./auth.json')

async function startBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  })

  sock.ev.on('creds.update', saveState)

  sock.ev.on('messages.upsert', async ({ messages }) => {
    const msg = messages[0]
    if (!msg.message || msg.key.fromMe) return

    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || ''

    if (text.toLowerCase() === '!jadwal') {
      const res = await axios.get('https://your-vercel-app.vercel.app/api/jadwal') // <- Ganti ini
      await sock.sendMessage(msg.key.remoteJid, { text: res.data.jadwal })
    }

    if (text.toLowerCase() === '!buka') {
      await sock.groupSettingUpdate(msg.key.remoteJid, 'not_announcement')
      await sock.sendMessage(msg.key.remoteJid, { text: '✅ Grup dibuka' })
    }

    if (text.toLowerCase() === '!tutup') {
      await sock.groupSettingUpdate(msg.key.remoteJid, 'announcement')
      await sock.sendMessage(msg.key.remoteJid, { text: '🔒 Grup ditutup' })
    }
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut
      if (shouldReconnect) startBot()
    }
  })
}

startBot()

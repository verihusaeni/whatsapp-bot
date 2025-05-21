const { default: makeWASocket, useSingleFileAuthState } = require('@whiskeysockets/baileys')
const pino = require('pino')

const { state, saveState } = useSingleFileAuthState('./session/auth.json')

async function startBot() {
    const sock = makeWASocket({
        logger: pino({ level: 'silent' }),
        printQRInTerminal: true,
        auth: state
    })

    sock.ev.on('creds.update', saveState)

    sock.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0]
        if (!msg.message) return

        const pesan = msg.message.conversation || msg.message.extendedTextMessage?.text || ""
        const from = msg.key.remoteJid

        if (pesan.toLowerCase() === "jadwal") {
            const jadwal = "📚 Jadwal Hari Ini:
1. Matematika
2. Bahasa Inggris
3. IPA"
            await sock.sendMessage(from, { text: jadwal })
        }

        if (pesan.toLowerCase() === "shalat") {
            const shalat = "🕌 Jadwal Shalat:
- Subuh: 04:40
- Dzuhur: 12:00
- Ashar: 15:20
- Maghrib: 18:00
- Isya: 19:10"
            await sock.sendMessage(from, { text: shalat })
        }

        if (pesan.toLowerCase() === "tutup grup") {
            await sock.groupSettingUpdate(from, "announcement") // Tutup grup
            await sock.sendMessage(from, { text: "🔒 Grup ditutup oleh bot." })
        }

        if (pesan.toLowerCase() === "buka grup") {
            await sock.groupSettingUpdate(from, "not_announcement") // Buka grup
            await sock.sendMessage(from, { text: "🔓 Grup dibuka oleh bot." })
        }
    })
}

startBot()
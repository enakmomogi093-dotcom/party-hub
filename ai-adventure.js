const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
let gameRooms = {};

app.post('/api/ai-adventure/start', async (req, res) => {
    const { roomCode, theme } = req.body;
    const systemPrompt = `Kamu adalah Game Master untuk sebuah text-adventure game multiplayer. Tema cerita: ${theme}. Berikan narasi awal yang menegangkan (maksimal 3 paragraf). Di akhir narasi, tanyakan apa yang ingin dilakukan oleh para pemain.`;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(systemPrompt);
        const responseText = result.response.text();
        gameRooms[roomCode] = { history: [ { role: "user", parts: [{ text: systemPrompt }] }, { role: "model", parts: [{ text: responseText }] } ] };
        res.json({ success: true, message: responseText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memulai game.' });
    }
});

app.post('/api/ai-adventure/action', async (req, res) => {
    const { roomCode, playerName, action } = req.body;
    if (!gameRooms[roomCode]) { return res.status(404).json({ success: false, error: 'Room tidak ditemukan.' }); }
    const promptAction = `Pemain bernama ${playerName} melakukan aksi: "${action}". Lanjutkan cerita berdasarkan aksi ini. Berikan konsekuensi (baik/buruk) dan tantangan baru.`;
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const chat = model.startChat({ history: gameRooms[roomCode].history });
        const result = await chat.sendMessage(promptAction);
        const responseText = result.response.text();
        gameRooms[roomCode].history.push({ role: "user", parts: [{ text: promptAction }] });
        gameRooms[roomCode].history.push({ role: "model", parts: [{ text: responseText }] });
        res.json({ success: true, message: responseText });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, error: 'Gagal memproses aksi.' });
    }
});

module.exports = app;

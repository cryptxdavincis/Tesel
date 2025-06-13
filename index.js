const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Path direktori dan file database
const dbDir = path.join(__dirname, 'tmp');
const dbFile = path.join(dbDir, 'DB.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

// Buat folder dan file jika belum ada
function ensureDB() {
    if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
    }

    if (!fs.existsSync(dbFile)) {
        fs.writeFileSync(dbFile, JSON.stringify([]), 'utf-8');
    }
}
ensureDB();

// Fungsi bantu untuk baca/tulis file database
function readDB() {
    ensureDB();
    return JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
}

function writeDB(data) {
    ensureDB();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
}

// Rute tampilan form absen
app.get('/', (req, res) => {
    res.send(`
        <h2>Form Absen</h2>
        <form method="POST" action="/absen">
            <input type="text" name="nama" placeholder="Masukkan nama" required />
            <button type="submit">Absen</button>
        </form>
        <br />
        <a href="/data">Lihat Daftar Absen</a>
    `);
});

// Rute proses absen
app.post('/absen', (req, res) => {
    const { nama } = req.body;
    const data = readDB();
    const waktu = new Date().toISOString();

    data.push({ nama, waktu });
    writeDB(data);

    res.send(`<p>Terima kasih, <b>${nama}</b>. Absen dicatat pada: ${waktu}</p><a href="/">Kembali</a>`);
});

// Rute lihat data absen
app.get('/data', (req, res) => {
    const data = readDB();
    const list = data.length > 0
        ? data.map((item, i) => `<li>${i + 1}. ${item.nama} - ${item.waktu}</li>`).join('')
        : '<li>Belum ada data absen.</li>';

    res.send(`
        <h2>Daftar Absen</h2>
        <ul>${list}</ul>
        <a href="/">Kembali ke Form</a>
    `);
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server absen berjalan di http://localhost:${PORT}`);
});

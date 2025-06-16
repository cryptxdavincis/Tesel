const express = require('express');
const { exec } = require('child_process');

const app = express();
const port = process.env.PORT || 7860;

app.use(express.json());

// Halaman HTML langsung dari route /
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Bash Executor</title>
      <style>
        body {
          font-family: monospace;
          background: #121212;
          color: #00ff00;
          padding: 20px;
        }
        textarea, pre {
          width: 100%;
          background: #1e1e1e;
          color: #00ff00;
          border: none;
          padding: 10px;
          font-size: 16px;
        }
        button {
          margin-top: 10px;
          background: #333;
          color: white;
          border: none;
          padding: 10px 20px;
          cursor: pointer;
        }
        button:hover {
          background: #555;
        }
      </style>
    </head>
    <body>
      <h1>Bash Web Executor</h1>
      <textarea id="command" rows="4" placeholder="Masukkan perintah bash di sini..."></textarea>
      <button onclick="runCommand()">Jalankan</button>
      <h2>Output:</h2>
      <pre id="output">Menunggu perintah...</pre>

      <script>
        async function runCommand() {
          const command = document.getElementById('command').value;
          const outputElement = document.getElementById('output');
          outputElement.textContent = "Menjalankan perintah...";

          try {
            const res = await fetch('/run', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ command })
            });

            const data = await res.json();
            if (data.error) {
              outputElement.textContent = "Error:\\n" + data.error;
            } else {
              outputElement.textContent = data.stdout || '(Tidak ada output)\\n' + (data.stderr || '');
            }
          } catch (err) {
            outputElement.textContent = "Request error:\\n" + err.message;
          }
        }
      </script>
    </body>
    </html>
  `);
});

// Endpoint untuk eksekusi perintah bash
app.post('/run', (req, res) => {
  const { command } = req.body;

  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Command tidak valid' });
  }

  // Optional: batasi perintah berbahaya
  if (command.includes('rm') || command.includes('shutdown') || command.includes(':(){')) {
    return res.status(403).json({ error: 'Command tidak diizinkan' });
  }

  exec(command, (error, stdout, stderr) => {
    if (error) {
      return res.status(500).json({ error: error.message });
    }
    res.json({ stdout, stderr });
  });
});

// Mulai server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});

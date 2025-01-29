const express = require('express');
const bodyParser = require('body-parser');
const { KafkaClient, Producer } = require('kafka-node');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

app.use(bodyParser.json());

const client = new KafkaClient({ kafkaHost: 'localhost:9092' });
const producer = new Producer(client);

producer.on('ready', () => console.log('Kafka Producer está listo.'));
producer.on('error', (err) => console.error('Error en Kafka:', err));

// Configuración de SQLite
const db = new sqlite3.Database('./messages.db', (err) => {
    if (!err) {
        console.log('Conectado a SQLite.');
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic TEXT,
            message TEXT,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

app.post('/publish', (req, res) => {
    const { topic, message } = req.body;
    if (!topic || !message) {
        return res.status(400).json({ status: "error", message: "Proporciona un 'topic' y un 'message'." });
    }

    producer.send([{ topic, messages: message }], (err, data) => {
        if (err) return res.status(500).json({ status: "error", message: "Error en Kafka." });

        db.run(`INSERT INTO messages (topic, message) VALUES (?, ?)`, [topic, message], function (dbErr) {
            if (dbErr) return res.status(500).json({ status: "error", message: "Error en SQLite." });

            res.json({ status: "success", message: "Mensaje enviado a Kafka y guardado en SQLite.", data: { id: this.lastID, topic, message, timestamp: new Date().toISOString() } });
        });
    });
});

app.get('/messages', (req, res) => {
    db.all(`SELECT * FROM messages ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) return res.status(500).json({ status: "error", message: "Error obteniendo mensajes." });
        res.json({ status: "success", message: "Lista de mensajes guardados.", count: rows.length, data: rows });
    });
});

app.listen(port, () => console.log(`API ejecutándose en http://localhost:${port}`));

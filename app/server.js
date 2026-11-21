
require('dotenv').config();

const express = require('express');
const db = require('./db');
const redisClient = require('./redis');

const app = express();

app.use(express.json());


app.get('/health', async (req, res) => {
    res.json({
        status: 'UP',
        application: 'Loja API',
        version: '2.0',
        message: 'Nova versão instalada'
    });
});


app.get('/produtos', async (req, res) => {
    try {
        const [produtos] = await db.execute(
            'SELECT * FROM produtos'
        );

        res.json(produtos);
    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao consultar produtos'
        });
    }
});


app.post('/produtos', async (req, res) => {
    try {
        const { nome, preco } = req.body;

        if (!nome || preco == null || Number(preco) <= 0) {
            return res.status(400).json({
                erro: 'Informe nome e preço válido'
            });
        }

        const [resultado] = await db.execute(
            'INSERT INTO produtos (nome, preco) VALUES (?, ?)',
            [nome, Number(preco)]
        );

        await redisClient.del('produtos');

        res.status(201).json({
            id: resultado.insertId,
            nome,
            preco: Number(preco)
        });

    } catch (error) {
        res.status(500).json({
            erro: 'Erro ao cadastrar produto'
        });
    }
});

async function iniciar() {
    try {
        await db.query('SELECT 1');

await db.execute(`
    CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(150) NOT NULL,
        preco DECIMAL(10,2) NOT NULL
    )
`);

await redisClient.connect();

        const PORT = process.env.PORT || 3000;

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`Loja API rodando na porta ${PORT}`);
        });

    } catch (error) {
        console.error('Erro ao iniciar aplicação:', error.message);
        process.exit(1);
    }
}

iniciar();

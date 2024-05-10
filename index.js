const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; 
const path = require('path');

const app = express();
const port = 3939;

app.use(bodyParser.json());

const filePath = path.join(__dirname, 'times.json');

class Time {

    constructor(filePath){
        this.filePath = filePath;
    }

        createTime(nome, estado, sigla, escudo){
            return {
                nome,
                estado,
                sigla,
                escudo
            }
        }

        async loadTimes() {
            try {
                const data = await fs.readFile(filePath, 'utf8');
                return JSON.parse(data);
            } catch (error) {
                return [];
            }
        }

        async saveTimes(times) {
            try {
                await fs.writeFile(filePath, JSON.stringify(times, null, 2), 'utf8');
            } catch (error) {
                console.error('Erro ao salvar os times:', error);
            }
        }       
}

const time = new Time(filePath);

app.post('/times', async (req, res) => {
    const { nome, estado, sigla, escudo } = req.body;

    if (!nome || !estado || !sigla || !escudo ) {
        return res.status(400).send("Por favor, forneça o nome e o estado do time.");
    }

    let times = await time.loadTimes();
    
    if (times.some(t => t.sigla === sigla || t.nome === nome)){
        return res.status(400).send("Time já existe");
    }


    const novoTime = time.createTime(nome, estado, sigla, escudo)

    
    times.push(novoTime); 
    await time.saveTimes(times); 

    res.status(201).send(novoTime);
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
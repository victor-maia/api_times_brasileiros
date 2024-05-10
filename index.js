const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs').promises; 
const path = require('path');

const app = express();
const port = 3333;

'app.use(bodyParser.json());'


app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});

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
        
        

        async filterTimesByState(estado){
            let times = await this.loadTimes();
            let filteredTimes = times.filter(t => t.estado.toLowerCase() === estado.toLowerCase())

          
            return filteredTimes
        }
}

const time = new Time(filePath);


// Adicionar time

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

// Remover time

app.delete('/times/:nome', async (req, res) => {
    const { nome } = req.params

    let times = await time.loadTimes()

    const index = times.findIndex(t => t.nome.toLowerCase() === nome.toLowerCase());

  

    if(index === -1){
        return res.status(404).send("Time não encontrado")
    }

    times.splice(index, 1);

    await time.saveTimes(times);

    res.status(200).send("Time deletado com sucesso")
})



app.get('/times/:estado', async (req, res, next) => {
    const { estado } = req.params;

    let times = await time.filterTimesByState(estado);


    try {
        let times = await time.filterTimesByState(estado);

        if (times.length === 0) {
            throw new Error('Estado não possui times cadastrados');
        }

        res.status(200).send(times);
    } catch (error) {
        next(error); 
    }

});
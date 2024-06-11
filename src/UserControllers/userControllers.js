const Time = require('../Times/times.js');
const time = new Time();
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key_here';

const databasePath = path.join(__dirname, '..', 'database', 'users.json');

class UserController {

    async login(req, res){

        console.log('Caminho do arquivo:', databasePath);
        
        const { username, password } = req.body;

        try {
            // Carrega os usuários do arquivo JSON
            const data = await fs.readFile(databasePath, 'utf8');
            const users = JSON.parse(data);
    
 
            const user = users.find(u => u.username === username && u.password === password);
            if (!user) {
                return res.status(401).json({ message: 'Credenciais inválidas' });
            }
    
            const token = jwt.sign({ username }, secretKey, { expiresIn: '1h' });
            res.json({ token });
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            res.status(500).json({ message: 'Erro ao fazer login' });
        }
    }

    async createTeam(req, res) {
        const { nome, estado, sigla, escudo, descricao, xBrasileiro, divisao } = req.body;

        if (!nome || !estado || !sigla || !escudo || !descricao || !xBrasileiro) {
            return res.status(400).send("Por favor, forneça todos os dados do time.");
        }

        let times = await time.loadTimes();

        if (times.some(t => t.sigla === sigla || t.nome === nome)) {
            return res.status(400).send("Time já existe");
        }

        const novoTime = time.createTime(nome, estado, sigla, escudo, descricao, xBrasileiro, divisao);

        times.push(novoTime);
        await time.saveTimes(times);

        res.status(201).send(novoTime);
    }

    async deleteTeam(req, res) {
        const { nome } = req.params;

        let times = await time.loadTimes();

        const index = times.findIndex(t => t.nome.toLowerCase() === nome.toLowerCase());

        if (index === -1) {
            return res.status(404).send("Time não encontrado");
        }

        times.splice(index, 1);
        await time.saveTimes(times);

        res.status(200).send("Time deletado com sucesso");
    }



    async allTeams(req, res){
        try {
            let times = await time.loadTimes();
            res.status(200).send(times);
        } catch (error) {
            res.status(500).send("Erro ao carregar os times.");
        }
    
    }


    async seeTeamsByName(req, res) {
        const { nome } = req.params;

        try {
            let times = await time.filterTimesByName(nome);
    
            if (times.length === 0) {
                throw new Error(`Time ${nome} não cadastrado na nossa base de dados!`);
            }
    
            res.status(200).send(times);
        } catch (error) {
            next(error); 
        }
    }


    async seeTeamsByState(req, res, next){
        const { estado } = req.params;

        try {
            const time = new Time();
            let times = await time.filterTimesByState(estado);
    
            if (times.length === 0) {
                throw new Error('Estado não possui times cadastrados');
            }
    
            res.status(200).send(times);
        } catch (error) {
            next(error);
        }
    }

    async updateTeam(req, res) {
        const { nome } = req.params;
        const { novoNome, estado, sigla, escudo, descricao, xBrasileiro, divisao } = req.body;

        let times = await time.loadTimes();

        const index = times.findIndex(t => t.nome.toLowerCase() === nome.toLowerCase());

        if (index === -1) {
            return res.status(404).send("Time não encontrado.");
        }

        times[index] = {
            ...times[index],
            nome: novoNome || times[index].nome,
            estado: estado || times[index].estado,
            sigla: sigla || times[index].sigla,
            escudo: escudo || times[index].escudo,
            descricao: descricao || times[index].descricao,
            xBrasileiro: xBrasileiro || times[index].xBrasileiro,
            divisao: divisao || times[index].divisao
        };

        await time.saveTimes(times);

        res.status(200).send(times[index]);
    }

}

module.exports = UserController;
const Time = require('../Times/times.js');
const time = new Time();

class UserController {
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
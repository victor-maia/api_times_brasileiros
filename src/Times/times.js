const fs = require('fs').promises;
const path = require('path');

class Time {
    constructor(filePath) {
        this.filePath = filePath || path.join(__dirname, '..', 'database', 'times.json');
    }

    createTime(nome, estado, sigla, escudo, descricao, xBrasileiro, divisao) {
        return {
            nome,
            estado,
            sigla,
            escudo,
            descricao,
            xBrasileiro,
            divisao
        };
    }

    async loadTimes() {
        try {
            const data = await fs.readFile(this.filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    }

    async saveTimes(times) {
        try {
            await fs.writeFile(this.filePath, JSON.stringify(times, null, 2), 'utf8');
        } catch (error) {
            console.error('Erro ao salvar os times:', error);
        }
    }

    async filterTimesByName(nome) {
        let times = await this.loadTimes();
        return times.filter(t => t.nome.toLowerCase() === nome.toLowerCase());
    }

    async filterTimesByState(estado) {
        let times = await this.loadTimes();
        return times.filter(t => t.estado.toLowerCase() === estado.toLowerCase());
    }
}

module.exports = Time;
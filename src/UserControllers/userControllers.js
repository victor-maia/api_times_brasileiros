const Time = require('../Times/times.js');
const time = new Time();
const path = require('path');
const fs = require('fs').promises;
const jwt = require('jsonwebtoken');
const secretKey = 'your_secret_key_here';

const databasePath = path.join(__dirname, '..', 'database', 'users.json');

class UserController {
  
  /**
   * @swagger
   * /login:
   *   post:
   *     summary: Realiza login de um usuário cadastrado pelo adm. do banco de dados
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               username:
   *                 type: string
   *                 example: user123
   *               password:
   *                 type: string
   *                 example: pass123
   *     responses:
   *       200:
   *         description: Usuário logado com sucesso
   *       401:
   *         description: Credenciais inválidas
   */
  async login(req, res) {
    console.log('Caminho do arquivo:', databasePath);
    
    const { username, password } = req.body;

    try {
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

  /**
   * @swagger
   * /times:
   *   post:
   *     summary: Cria um novo time
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               nome:
   *                 type: string
   *                 example: Flamengo
   *               estado:
   *                 type: string
   *                 example: RJ
   *               sigla:
   *                 type: string
   *                 example: FLA
   *               escudo:
   *                 type: string
   *                 example: url-do-escudo
   *               descricao:
   *                 type: string
   *                 example: Time de futebol
   *               xBrasileiro:
   *                 type: integer
   *                 example: 6
   *               divisao:
   *                 type: string
   *                 example: Série A
   *     responses:
   *       201:
   *         description: Time criado com sucesso
   *       400:
   *         description: Dados incompletos ou time já existe
   */
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

  /**
   * @swagger
   * /times/{nome}:
   *   delete:
   *     summary: Deleta um time pelo nome
   *     parameters:
   *       - in: path
   *         name: nome
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome do time
   *     responses:
   *       200:
   *         description: Time deletado com sucesso
   *       404:
   *         description: Time não encontrado
   */
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

  /**
   * @swagger
   * /times/todos:
   *   get:
   *     summary: Retorna todos os times
   *     responses:
   *       200:
   *         description: Lista de times
   *       500:
   *         description: Erro ao carregar os times
   */
  async allTeams(req, res) {
    try {
      let times = await time.loadTimes();
      res.status(200).send(times);
    } catch (error) {
      res.status(500).send("Erro ao carregar os times.");
    }
  }

  /**
   * @swagger
   * /times/{nome}:
   *   get:
   *     summary: Busca times pelo nome
   *     parameters:
   *       - in: path
   *         name: nome
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome do time
   *     responses:
   *       200:
   *         description: Time encontrado
   *       404:
   *         description: Time não cadastrado
   */
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

  /**
   * @swagger
   * /times/estado/{estado}:
   *   get:
   *     summary: Busca times pelo estado
   *     parameters:
   *       - in: path
   *         name: estado
   *         schema:
   *           type: string
   *         required: true
   *         description: Estado do time
   *     responses:
   *       200:
   *         description: Times encontrados
   *       404:
   *         description: Estado não possui times cadastrados
   */
  async seeTeamsByState(req, res, next) {
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

  /**
   * @swagger
   * /times/{nome}:
   *   put:
   *     summary: Atualiza os dados de um time
   *     parameters:
   *       - in: path
   *         name: nome
   *         schema:
   *           type: string
   *         required: true
   *         description: Nome do time a ser atualizado
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               novoNome:
   *                 type: string
   *                 example: NovoNome
   *               estado:
   *                 type: string
   *                 example: SP
   *               sigla:
   *                 type: string
   *                 example: NOV
   *               escudo:
   *                 type: string
   *                 example: url-do-novo-escudo
   *               descricao:
   *                 type: string
   *                 example: Nova descrição do time
   *               xBrasileiro:
   *                 type: integer
   *                 example: 5
   *               divisao:
   *                 type: string
   *                 example: Série B
   *     responses:
   *       200:
   *         description: Time atualizado com sucesso
   *       404:
   *         description: Time não encontrado
   */
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
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserController = require('./UserControllers/userControllers.js');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

const controllers = new UserController();

app.post('/times', (req, res) => controllers.createTeam(req, res));
app.put('/times/:nome', (req, res) => controllers.updateTeam(req, res));
app.delete('/times/:nome', (req, res) => controllers.deleteTeam(req, res));
app.get('/times/todos', (req, res) => controllers.allTeams(req, res));
app.get('/times/:nome', (req, res, next) => controllers.seeTeamsByName(req, res, next));
app.get('/times/estado/:estado', async (req, res, next) => {
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
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});
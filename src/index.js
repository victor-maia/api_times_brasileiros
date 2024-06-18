const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const UserController = require('./UserControllers/userControllers.js');
const swaggerSetup = require('./swagger'); // Importe o Swagger

const app = express();


app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

app.get('/', function (req, res) {
    res.send('Hello World')
  })


swaggerSetup(app); // Configure o Swagger

const controllers = new UserController();

app.post('/login', (req, res) => controllers.login(req, res));
app.post('/times', (req, res) => controllers.createTeam(req, res));
app.put('/times/:nome', (req, res) => controllers.updateTeam(req, res));
app.delete('/times/:nome', (req, res) => controllers.deleteTeam(req, res));
app.get('/times/todos', (req, res) => controllers.allTeams(req, res));
app.get('/times/:nome', (req, res, next) => controllers.seeTeamsByName(req, res, next));
app.get('/times/estado/:estado', (req, res, next) => controllers.seeTeamsByState(req, res, next));

app.listen(process.env.port || 3000)


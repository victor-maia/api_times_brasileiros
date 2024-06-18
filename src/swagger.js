// src/swagger.js
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Times Brasileiros',
      version: '1.0.0',
      description: 'API para gerenciamento de times de futebol brasileiros, desenvolvida em Node.js. Esta API permite criar, listar, atualizar e excluir times, além de buscar times por nome e estado.',
      contact: {
        name: 'Victor Maia',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
  },
  apis: ['./src/UserControllers/userControllers.js'], // Caminho para os arquivos de rotas/controladores
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
};
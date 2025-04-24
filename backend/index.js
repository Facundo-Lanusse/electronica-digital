const express = require('express');
const bodyParser = require('body-parser');
const mqttRoute = require('./routes/mqttConfig');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use('/api', mqttRoute);

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor Express corriendo en http://0.0.0.0:${PORT}`);
});

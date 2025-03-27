const express = require('express');
const app = express();

app.get('/', (req, res) => {
    res.send('Faca putaso');
});

app.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

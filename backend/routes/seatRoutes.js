//routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase');

router.get('/seats/:trainId', async (req, res) => {

    const { trainId } = req.params;

    try {
        const result = await db.query(
            'SELECT seat_number, railcar_number, is_occupied ' +
            'FROM seat ' +
            'where train_id = $1 ' +
            'order by railcar_number, seat_number',
            [trainId]
        );
        res.json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error al consultar asientos');
    }

});

module.exports = router;
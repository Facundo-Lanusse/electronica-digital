//routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const db = require('../dataBase');
const {query, json} = require("express");

router.get('/seats/:trainId', async (req, res) => {

    const { trainId } = req.params;

    try {
        const result = await db.query(
            `SELECT * FROM seat`,
            [trainId]
        );
        res,json(result);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error al consultar asientos');
    }

});

module.exports = router;
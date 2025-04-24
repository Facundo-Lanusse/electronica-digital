const express = require('express');
const mqtt = require('mqtt');
const { Pool } = require('pg')
const router = express.Router();
const bodyParser = require('body-parser')
const db = require('../routes/mqttConfig');


const app = express();



module.exports = router;
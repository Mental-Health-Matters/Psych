const express = require('express')
const router = express.Router()

const {confirmation} = require('../controller/appointments.controller')

router.post('/confirmation', confirmation)

module.exports = router
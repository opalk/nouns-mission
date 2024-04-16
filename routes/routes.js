const express = require('express');
const { getNouns, updateNouns } = require('../controllers/controller.js');

const router = express.Router();

router.get('/', getNouns);
router.put('/', updateNouns);

module.exports = router;

const express = require('express');
const { createMessage, getMessages } = require('../controllers/sudhakarFeedbackController');
const router = express.Router();

router.post('/', createMessage);
router.get('/', getMessages);

module.exports = router;

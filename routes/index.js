const express = require('express');
const router = express.Router();


// INDEX ROUTE
router.get('/', async (req, res) => {
  res.send('ok');
});

module.exports = router;
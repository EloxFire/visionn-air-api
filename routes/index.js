const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const { term_colors } = require('../scripts/utils');

const database = mysql.createConnection({
  host: process.env.DATABASE_HOST || 'localhost',
  user: process.env.DATABASE_USER || 'root',
  password: process.env.DATABASE_PASSWORD || 'root',
  database: process.env.DATABASE_NAME || 'visionn_air',
  port: process.env.DATABASE_PORT || 3306
});

database.connect((error) => {
  if (error) throw error;
  console.log(`\n${term_colors.FgWhite}${term_colors.Bright}Connected to database ${term_colors.Italic}${process.env.DATABASE_NAME}${term_colors.Reset}`);
})


// GET DATA FROM LAST 7 DAYS
router.get('/', async (req, res) => {
  const sqlQuery = `SELECT * FROM all_time_history WHERE created_at BETWEEN DATE_SUB(NOW(), INTERVAL 7 DAY) AND NOW()`;

  database.query(sqlQuery, (err, rows, fields) => {
    if (err) throw err;
    if (rows.length === 0) { res.status(204).json({ message: 'Request successful, but no data found' }); return; };
    res.status(200).send(rows);
  })
});

module.exports = router;
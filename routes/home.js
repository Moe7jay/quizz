const express = require('express');
const router = express.Router();

module.exports = (db) => {
  //home page to see public quizzes
  router.get('/', (req, res) => {
    db.query(`
    SELECT * FROM quizzes WHERE isPrivate = FALSE;
    `)
    .then(data => {
      const templateVar = {quizzes: data.rows, user_id: req.params.user_id};
      res.render('../views/home', templateVar);
    })
  });
  // router.get('/:user_id', (req, res) => {
  //   db.query(`
  //   SELECT * FROM quizzes WHERE isPrivate = FALSE;
  //   `)
  //   .then(data => {
  //     const templateVar = {quizzes: data.rows, user_id: req.params.user_id};
  //     res.render('../views/home', templateVar);
  //   })
  // });
  return router;
};

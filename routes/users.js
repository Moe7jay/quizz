/*
 * All routes for Users are defined here
 * Since this file is loaded in server.js into api/users,
 *   these routes are mounted onto /users
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router  = express.Router();

module.exports = (db) => {
  router.get("/:user_id", (req, res) => {

    // db.query(`SELECT * FROM quizzes WHERE user_id = $1;`,[req.params.user_id])
    db.query(`SELECT * FROM quizzes WHERE user_id = $1 OR isPrivate = $2;`,[req.params.user_id, false]).then(data => {
        const templateVars = {quizzes: data.rows, user_id: req.params.user_id};
        res.render('../views/home', templateVars);
      })
      .catch(err => {
        res
          .status(500)
          .json({ error: err.message });
      });
  });
  router.get("/:user_id/makequiz", (req, res) => {
    let templateVar = { user_id: req.params.user_id };
    res.render('../views/makeQuiz', templateVar);
  })

  router.post("/:user_id/makequiz", (req, res) => {
    let query = `INSERT INTO quizzes (user_id, name, description, isPrivate)
                VALUES ($1, $2, $3, $4) RETURNING id`;
    let values = [req.params.user_id, req.body.name, req.body.description, req.body.isPrivate==="true"?true:false];
      db.query(query, values)
        .then(data => {
          const quiz = data.rows;
          let quizid = data.rows[0].id
          res.redirect(`/quiz/${quizid}/questions`);
        })
      .catch(err => {
        res.send(`Please click back and complete the form.`);
      });
    });
    router.post("/:user_id/delete/:quiz_id", (req, res) => {
      db.query(`DELETE FROM quizzes WHERE id = $1 AND user_id = $2;`,
      [req.params.quiz_id, req.params.user_id])
      .then(() => {
        res.redirect(`/users/${req.params.user_id}`);
      });
    });
  return router;
};

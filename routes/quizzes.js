/*
 * All routes for Widgets are defined here
 * Since this file is loaded in server.js into api/widgets,
 *   these routes are mounted onto /widgets
 * See: https://expressjs.com/en/guide/using-middleware.html#middleware.router
 */

const express = require('express');
const router = express.Router();

module.exports = (db) => {

  //Get all quizzes
  router.get('/:quiz_id', (req, res) => {
    db.query(`
    SELECT user_id, question_id, quizzes.name, questions.question, answers.answer, quiz_id, answers.isCorrect
    FROM answers
    JOIN questions ON questions.id = answers.question_id
    JOIN quizzes ON quizzes.id = questions.quiz_id
    JOIN users ON user_id = users.id
    WHERE quiz_id = $1
    GROUP BY user_id, question_id, quizzes.name, questions.question, answers.answer, quiz_id, answers.isCorrect, questions.id
    ORDER BY questions.id;`, [req.params.quiz_id])
      .then(data => {
        let templateVar = { input: data.rows }
        res.render('../views/quizzProgress', templateVar)
      });
  });

  // Add questions to the quiz

  router.get("/:quizid/questions", (req, res) => {
    // req.session.quiz_id = req.params.quizid;
    db.query(`SELECT id, user_id FROM quizzes WHERE id = $1`, [req.params.quizid])
    .then(data => {
      let templateVar = { quiz_id: req.params.quizid, user: data.rows[0] };
      res.render('../views/questions', templateVar);
    })
  })
    // Adding questions to the database

    router.post("/:quizid/questions", (req, res) => {
      let query = `INSERT INTO questions (quiz_id, question)
                  VALUES ($1, $2) RETURNING *;`;
      let values = [req.params.quizid, req.body.question];
      // req.session.quiz_id = req.params.quizid;
      db.query(query, values)
        .then(data => {
          const question = data.rows;
          let question_id = question[0].id;
          res.redirect(`/quiz/${req.params.quizid}/questions/${question_id}`);
        })
        .catch(err => {
          res
            .status(500)
            .json({ error: err.message });
        });
    });

  // routes to path where quiz creator can input answers

  router.get("/:quizid/questions/:questionid", (req, res) => {
    db.query(`SELECT question, user_id
              FROM questions
              JOIN quizzes ON (quiz_id = quizzes.id)
              WHERE questions.id = $1;`, [req.params.questionid])
      .then(data => {
        let question = data.rows[0];
        let templateVars = { quiz_id: req.params.quizid, question_id: req.params.questionid, question };
        res.render('../views/answers', templateVars);
      });
  });


  return router;
};


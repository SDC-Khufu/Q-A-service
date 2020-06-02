const express = require('express');
const router = express.Router();
const controller = require('../controllerNModel/QnAControllerNModel');

router.get('/qa/:product_id', controller.getQuestionsByProductId);
router.get('/qa/:question_id/answers', controller.getAnswersByQuestionId);
// router.post('/qa/:question_id', controller.addQuestionToAProductId);
// router.post('/qa/:question_id/answers', controller.addAnswerToAQuestionId);
// router.put('/qa/question/:question_id/helpful', controller.markHelpfulByQuestionId);
// router.put('/qa/answer/:answer_id/helpful', controller.markHelpfulByAnswerId);
// router.put('/qa/question/:question_id/report', controller.reportByQuestionId);
// router.put('/qa/answer/:answer_id/report', controller.reportByAnswerId);

module.exports = router;






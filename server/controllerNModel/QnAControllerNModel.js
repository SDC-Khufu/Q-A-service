const pool = require("../db/index");

const transform = (dbRes, product_id) => {
  let finalData = { "product_id": `${product_id}`, "results": [] };
  let tempQnA = {};
  let curQId = 0;
  if (dbRes.rows.length) {
    dbRes.rows.forEach((row, ind) => {
      if (ind === dbRes.rows.length - 1) {
        finalData.results = finalData.results.concat(tempQnA);
      };
      if (row.question_id !== curQId) {
        if (curQId !== 0) { finalData.results = finalData.results.concat(tempQnA) };
        curQId = row.question_id;
        tempQnA = {
          "question_id": row.question_id,
          "question_body": row.question_body,
          "question_date": row.question_date,
          "asker_name": row.asker_name,
          "question_helpfulness": row.question_helpfulness,
          "reported": 0,
          "answers": {}
        }
        if (row.answer_id) {
          tempQnA.answers[row.answer_id] = {
            "id": row.answer_id,
            "body": row.body,
            "date": row.date,
            "answerer_name": row.answerer_name,
            "helpfulness": row.helpfulness,
            "photos": row.url !== null ? [row.url] : []
          }
        }
      } else {
        if (tempQnA.answers[row.answer_id]) {
          tempQnA.answers[row.answer_id].photos = tempQnA.answers[row.answer_id].photos.concat(row.url);
        } else {
          tempQnA.answers[row.answer_id] = {
            "id": row.answer_id,
            "body": row.body,
            "date": row.date,
            "answerer_name": row.answerer_name,
            "helpfulness": row.helpfulness,
            "photos": row.url !== null ? [row.url] : []
          }
        }
      }
    })
  }
  return finalData;
}

const getQuestionsByProductId = async (req, res) => {
  console.log("req params for Q", req.params);
  const product_id = req.params.product_id;
  let queryStr = `select distinct q.*,an.*, ap.photo_id, ap.url
  from questions_transformed q   
  inner join answers_transformed an on q.question_id = an.question_id and q.product_id = ${product_id}
  left join answers_photos_final ap on ap.answer_id = an.answer_id where an.reported = 0 and q.reported = 0;`;
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    let transformRes = transform(dbRes, product_id);
    res.status(200).json(transformRes);
  } catch (err) {
    console.log("Get server err for getting questions: ", err);
    res.status(400).json(`Couldn't get questions for this product`);
  } finally {
    await client.release();
  }
};

const getAnswersByQuestionId = async (req, res) => {
  //   console.log("req params for A", req.params);
  //   const question_id = req.params.question_id;
  //   let queryStr = `select * from answers_transformed where question_id = ${question_id}`;
  //   const client = await pool.connect();
  //   try {
  //     const dbRes = await client.query(queryStr);
  //     res.status(200).json(dbRes.rows);
  //   } catch (err) {
  //     console.log("Get server err for getting answers: ", err);
  //     res.status(400).json(`Couldn't get answers for this question`);
  //   } finally {
  //     await client.release();
  //   }
};

// const getAnswersByQuestionId = (question_id) => {
//   const fromDate = new Date();
//   let queryStr = `select * from answers_transformed where id = ${question_id}`;
//   pool.connect().then((client) => {
//     return client
//       .query(queryStr)
//       .then((dbRes) => {
//         client.release();
//         console.log(`Only go through for successful getAnswersByQuestionId`);
//         const toDate = new Date();
//         const elapsed = toDate.getTime() - fromDate.getTime();
//         let answersWithTime = [{ elapsed }, dbRes.rows];
//         console.log('answersWithTime', answersWithTime);
//         return answersWithTime;
//       })
//       .catch((err) => {
//         client.release();
//         console.log(`Get server err for getAnswersByQuestionId: ${err}`);
//       });
//   });
// };

module.exports = {
  getQuestionsByProductId,
  getAnswersByQuestionId,
  // addQuestionToAProductId,
  // addAnswerToAQuestionId,
  // markHelpfulByQuestionId,
  // markHelpfulByAnswerId,
  // reportByQuestionId,
  // reportByAnswerId
};

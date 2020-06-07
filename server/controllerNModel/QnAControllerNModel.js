const pool = require("../db/index");

const transform = (dbRes, product_id) => {
  let finalData = { "product_id": `${product_id}`, "results": [] };
  let tempQnA = {};
  let curQId = 0;
  if (dbRes.rows.length) {
    dbRes.rows.forEach((row, ind) => {
      let photoUrl = row.url !== null ? [row.url] : []
      if (row.url !== null && row.url[0] === '[') {
        photoUrl = JSON.parse(row.url);
      }
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
            // "photos": row.url !== null ? [row.url] : []
            "photos": photoUrl
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
            "photos": photoUrl
          }
        }
      }
      if (ind === dbRes.rows.length - 1) {
        finalData.results = finalData.results.concat(tempQnA);
      };
    })
  }
  return finalData;
}

const getQuestionsByProductId = async (req, res) => {
  // console.log("req params for Q", req.params);
  const product_id = req.params.product_id;
  let queryStr = `select distinct q.*, an.answer_id, an.body, an.date, an.answerer_name, an.helpfulness, ap.photo_id, ap.url
  from questions_transformed q
  left join answers_transformed an on q.question_id = an.question_id and an.reported = 0
  left join answers_photos_final ap on ap.answer_id = an.answer_id where q.product_id = ${product_id} and q.reported = 0;`;

  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    // console.log('dbRes.rows', dbRes.rows)
    let transformedRes = transform(dbRes, product_id);
    res.status(200).json(transformedRes);
  } catch (err) {
    console.log("Get server err for getting questions: ", err);
    res.status(400).json(`Couldn't get questions for this product`);
  } finally {
    await client.release();
  }
};

//ignore this one for now
const getAnswersByQuestionId = async (req, res) => {
    // console.log("req params for A", req.params);
    // const question_id = req.params.question_id;
    // let queryStr = `select * from raw_answers where question_id = ${question_id}`;
    // const client = await pool.connect();
    // try {
    //   const dbRes = await client.query(queryStr);
    //   res.status(200).json(dbRes.rows);
    // } catch (err) {
    //   console.log("Get server err for getting answers: ", err);
    //   res.status(400).json(`Couldn't get answers for this question`);
    // } finally {
    //   await client.release();
    // }
};

const addQuestionToAProductId = async (req, res) => {
  // console.log('pramas', req.params, 'body', req.body);
  let product_id = Number(req.params.product_id);
  let queryStr = `insert into questions_transformed (product_id, question_body, question_date, asker_name, asker_email) 
                  values ($1, $2, $3, $4, $5);`
  let postDate = new Date();
  let values = [product_id, req.body.body, postDate, req.body.name, req.body.email];
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr, values);
    res.status(201).json('Created');
  } catch (err) {
    console.log("Get server err for posting questions: ", err);
    res.status(500).json(`Couldn't post question for this product`);
  } finally {
    await client.release();
  }
};

const addAnswerToAQuestionId = async (req, res) => {
  // console.log("req params for Add Answer", req.params, 'body for add answer', req.body);
  let question_id = Number(req.params.question_id);
  let answerQueryStr = `insert into answers_transformed (question_id, body, date, answerer_name, answerer_email) 
                  values ($1, $2, $3, $4, $5) returning answer_id;`
  let postDate = new Date();
  let answerValues = [question_id, req.body.body, postDate, req.body.name, req.body.email];
  const client = await pool.connect();
  try {
    const raw_answer_id = await client.query(answerQueryStr, answerValues);
    if (req.body.photos.length > 0) {
      let answer_id = Number(raw_answer_id.rows[0].answer_id);
      let photoQueryStr = `insert into answers_photos_final (answer_id, url) 
      values ($1, $2);`
      let photoValues = [answer_id, JSON.stringify(req.body.photos)];
      const dbRes = await client.query(photoQueryStr, photoValues);
    }
    res.status(201).json('Created');
  } catch (err) {
    console.log("Get server err for posting answers: ", err);
    res.status(500).json(`Couldn't post answer for this question`);
  } finally {
    await client.release();
  }
}

const markHelpfulByQuestionId = async (req, res) => {
  let question_id = Number(req.params.question_id);
  let queryStr = `update questions_transformed set question_helpfulness = question_helpfulness + 1 
                  where question_id = ${question_id}`;
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    res.status(204).json('');
  } catch (err) {
    console.log("Get server err for adding helpful: ", err);
    res.status(500).json(`Couldn't add helpful for this question`);
  } finally {
    await client.release();
  }
};

const markHelpfulByAnswerId = async (req, res) => {
  let answer_id = Number(req.params.answer_id);
  let queryStr = `update answers_transformed set helpfulness = helpfulness + 1 
                  where answer_id = ${answer_id}`;
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    res.status(204).json('');
  } catch (err) {
    console.log("Get server err for adding helpful: ", err);
    res.status(500).json(`Couldn't add helpful for this answer`);
  } finally {
    await client.release();
  }
};

const reportByQuestionId = async (req, res) => {
  let question_id = Number(req.params.question_id);
  let queryStr = `update questions_transformed set reported = reported + 1 
                  where question_id = ${question_id}`;
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    res.status(204).json('');
  } catch (err) {
    console.log("Get server err for reporting question: ", err);
    res.status(500).json(`Couldn't add report this question`);
  } finally {
    await client.release();
  }
};

const reportByAnswerId = async (req, res) => {
  let answer_id = Number(req.params.answer_id);
  let queryStr = `update answers_transformed set reported = reported + 1 
                  where answer_id = ${answer_id}`;
  const client = await pool.connect();
  try {
    const dbRes = await client.query(queryStr);
    res.status(204).json('');
  } catch (err) {
    console.log("Get server err for reporting answer: ", err);
    res.status(500).json(`Couldn't add reported for this answer`);
  } finally {
    await client.release();
  }
};
module.exports = {
  getQuestionsByProductId,
  getAnswersByQuestionId,
  addQuestionToAProductId,
  addAnswerToAQuestionId,
  markHelpfulByQuestionId,
  markHelpfulByAnswerId,
  reportByQuestionId,
  reportByAnswerId
};

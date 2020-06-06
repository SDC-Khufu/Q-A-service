const request = require("supertest")('http://localhost:3555');
// const app = require("../index");

// describe("Sample Test", () => {
//   it("should test that true === true", () => {
//     expect(true).toBe(true);
//   });
// });

describe("Test get QnA route: by product_id", () => {
    it('it should response the GET method', async () => {
        const response = await request.get('/qa/4');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('results');
    })
});

describe("Test post route", () => {
    it('it should post a question to a specific product_id', async () => {
        const body = {
            "body": "unit test to add a question to product 1",
            "name": "jest",
            "email": "Jest@lehigh.edu"
        };
        const res = await request.post('/qa/1').send(body);
        expect(res.statusCode).toBe(201);
        expect(res.body).toBe('Created');
    });

    it('it should post an answer to a specific question_id', async () => {
        const body = {
            "body": "Unit test to add a answer to question 3521777 in product 1",
            "name": "Jest",
            "email": "Jest@lehigh.edu",
            "photos": [
                "https://images.unsplash.com/photo-1500603720222-eb7a1f997356?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1653&q=80",
                "https://images.unsplash.com/photo-1536922645426-5d658ab49b81?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1650&q=80"
            ]
        };
        const res = await request.post('/qa/3521777/answers').send(body);
        expect(res.statusCode).toBe(201);
        expect(res.body).toBe('Created');
    });
});

describe('Test put routes', () => {
    it('Should put a helpful for question_id 1', async() => {
        const res = await request.put('/qa/question/1/helpful');
        expect(res.statusCode).toBe(204);
    });
    it('Should put a helpful for answer 12392954', async() => {
        const res = await request.put('/qa/answer/12392954/helpful');
        expect(res.statusCode).toBe(204);
    });
    it('Should put a report for question_id 3521637', async() => {
        const res = await request.put('/qa/question/3521637/report');
        expect(res.statusCode).toBe(204);
    });
    it('Should put a report for answer_id 12392953', async() => {
        const res = await request.put('/qa/answer/12392953/report');
        expect(res.statusCode).toBe(204);
        // expect(res.body).toBe('');
    });
})
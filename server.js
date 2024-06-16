const express = require('express');
const mysql = require('mysql');
const cors = require('cors')
const bodyParser = require('body-parser')
const randomString = require('randomstring')
const sendMail = require('./helpers/sendMail')
const port = process.env.PORT || 8000;
const db = require('./routes/userRoute')
const webRouter = require('./routes/webRoute')

const app = express();
app.use(express.json())


app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))


app.use(cors())


// middleware
app.use('/', webRouter)
app.set('views', './views');
app.set('view engine', 'ejs');

// app.get('/', (req, res) => {
//     res.send('Hello World!')
// })

app.get('/', (req, res) => {
    console.log('req qurery', req.query);
    res.render('index', req.query);
});

// signup for creating account
app.post('/signup', (req, res) => {

    const token = randomString.generate();
    const sql = "INSERT INTO shurq_log (`firstName`, `lastName`, `userName`, `email`, `password`, `confirmPassword`, `token` ) VALUES (?)";
    const values = [
        req.body.firstName,
        req.body.lastName,
        req.body.userName,
        req.body.email,
        req.body.password,
        req.body.confirmPassword,
        token,
    ]
    db.query(sql, [values], (err, data) => {
        if (err) {
            return res.json("Error");
        }

        const mailSubject = 'Mail Verification';
        const content = `<p>Hi ${req.body.firstName}, please <a href="https://shurq-project-server.onrender.com/mail-verification?token=${token}" >Verify</a> your mail.</p>`;
        sendMail(req.body.email, mailSubject, content)

        return res.json(data)
    })
})

// login
app.post('/sigin', (req, res) => {

    const token = randomString.generate();
    const sql = "SELECT * FROM shurq_log WHERE `email` = ? AND `password` = ? AND `is_verified` = 1";
    db.query(sql, [req.body.email, req.body.password], (err, data) => {
        if (err) {
            return res.json("Error");
        }
        if (data.length > 0) {
            return res.json('Success')
        }
        else {
            return res.json('login failed')
        }
    })
})

// app.post('/login', (req, res) => {
//     const sql = "SELECT * FROM shurq_log WHERE userName = ? AND password = ?";
//     db.query(sql, [req.body.userName, req.body.password], (err, data) => {
//         if(err) {
//             return res.json("Error");
//         }
//         if(data.length > 0) {
//             return res.json("Success")
//         }
//         else {
//             return res.json('Failed')
//         }
//     })
// })



app.listen(8000, () => {
    console.log(`authentication backed working perfectly on port ${port}`);
})
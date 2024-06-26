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



app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

const corsOptions = {
    origin: [
        'http://localhost:3000',
        'http://localhost:8000',
        'https://shurq-project-client.vercel.app',
        'https://shurq-project-server.onrender.com'
    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(cors())
app.use(express.json())


// middleware
app.use('/', webRouter)

app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => {
    res.send('Welcome to Shurq!!')
})

// app.get('/', (req, res) => {
//     res.render('index', req.query);
// });

// signup for creating account
app.post('/signup', (req, res) => {
    console.log('hit signup', req.body);

    const token = randomString.generate();
    const sql = "INSERT INTO shurq_log (`firstName`, `lastName`, `userName`, `email`, `password`, `confirmPassword`, `token`, is_verified ) VALUES (?)";
    const is_verified = 0;
    const values = [
        req.body.firstName,
        req.body.lastName,
        req.body.userName,
        req.body.email,
        req.body.password,
        req.body.confirmPassword,
        token,
        is_verified
    ]
    // console.log('sign values', values);
    db.query(sql, [values], (err, data) => {
        if (err) {
            // console.log('err s', err);
            return res.json(err);
        }

        const mailSubject = 'Mail Verification';
        const content = `<p>Hi ${req.body.firstName}, please <a href="https://shurq-project-server.onrender.com/mail-verification?token=${token}" >Verify</a> your mail.</p>`;
        sendMail(req.body.email, mailSubject, content)
        // console.log('data sign', data);
        return res.json(data)
    })
})

// login
app.post('/sigin', (req, res) => {

    const token = randomString.generate();
    const sql = "SELECT * FROM shurq_log WHERE `email` = ? AND `password` = ? AND `is_verified` = ?";
    const is_verified = 1;
    db.query(sql, [req.body.email, req.body.password, is_verified], (err, data) => {
        if (err) {
            return res.json(err);
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
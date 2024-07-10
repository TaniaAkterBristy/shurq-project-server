const express = require('express');
const dotenv = require('dotenv').config();
const pg = require('pg');
const cors = require('cors')
const bodyParser = require('body-parser')
const randomString = require('randomstring')
const sendMail = require('./helpers/sendMail')
const port = 8000 || process.env.PORT2;
const { pool } = require('./routes/userRoute')
const webRouter = require('./routes/webRoute')
const redis = require('redis');
const REDIS_PORT = 6379;

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

// redis code start

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));


const client = redis.createClient(REDIS_PORT);
app.get('/', cache, (req, res) => {
    res.send('Welcome to Shurq!!')
})
function setResponse(data) {
    return data;
}

let parsedData;

async function cache(req, res, next) {

    console.log('new cache fetching......');
    const cacheKey = 'cacheProductData';

    await client.connect();

    try {
        const cachedData = await client.get(cacheKey);

        if (cachedData !== null) {
            parsedData = JSON.parse(cachedData);
            res.send(setResponse(parsedData));
            await client.disconnect();
        } else {
            next();
        }

    } catch (err) {
        console.error('Error retrieving cached data:', err);
        next();
    }
}

// Route handler to fetch data
async function getRepos(req, res, next) {

    console.log('data fetching......');
    try {
        console.log('Fetching Data...');

        const queryCa = `SELECT competitor_asin FROM keyword_iq_ca ORDER BY scrape_date_time_ts DESC`;
        const queryEs = `SELECT competitor_asin FROM keyword_iq_es ORDER BY scrape_date_time_ts DESC`;
        const queryFr = `SELECT competitor_asin FROM keyword_iq_fr ORDER BY scrape_date_time_ts DESC`;
        const queryGb = `SELECT competitor_asin FROM keyword_iq_gb ORDER BY scrape_date_time_ts DESC`;
        const queryIt = `SELECT competitor_asin FROM keyword_iq_it ORDER BY scrape_date_time_ts DESC`;
        const queryJp = `SELECT competitor_asin FROM keyword_iq_jp ORDER BY scrape_date_time_ts DESC`;
        const queryUs = `SELECT competitor_asin FROM keyword_iq_us ORDER BY scrape_date_time_ts DESC`;

        const resultOfCa = await pool.query(queryCa);
        const resultOfEs = await pool.query(queryEs);
        const resultOfFr = await pool.query(queryFr);
        const resultOfGb = await pool.query(queryGb);
        const resultOfIt = await pool.query(queryIt);
        const resultOfJp = await pool.query(queryJp);
        const resultOfUs = await pool.query(queryUs);

        const finalResult = {
            resultOfCa: resultOfCa.rows,
            resultOfEs: resultOfEs.rows,
            resultOfFr: resultOfFr.rows,
            resultOfGb: resultOfGb.rows,
            resultOfIt: resultOfIt.rows,
            resultOfJp: resultOfJp.rows,
            resultOfUs: resultOfUs.rows,
        };

        const finalResultJson = JSON.stringify(finalResult);

        await client.set('cacheProductData', finalResultJson);

        res.send(setResponse(finalResultJson));
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).send('Error fetching data');
    }
}


app.post('/product-filter', async (req, res) => {
    const checkInfo = req.body;
    const checkInfo2 = checkInfo && Object.keys(checkInfo)[0]
    const resultOfCa = parsedData && parsedData.resultOfCa;
    const resultOfEs = parsedData && parsedData.resultOfEs;
    const resultOfFr = parsedData && parsedData.resultOfFr;
    const resultOfGb = parsedData && parsedData.resultOfGb;
    const resultOfIt = parsedData && parsedData.resultOfIt;
    const resultOfJp = parsedData && parsedData.resultOfJp;
    const resultOfUs = parsedData && parsedData.resultOfUs;

    if (checkInfo2 !== 'undefined') {
        const filteredFromCa = resultOfCa && resultOfCa.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromEs = resultOfEs && resultOfEs.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromFr = resultOfFr && resultOfFr.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromGb = resultOfGb && resultOfGb.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromIt = resultOfIt && resultOfIt.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromJp = resultOfJp && resultOfJp.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)
        const filteredFromUs = resultOfUs && resultOfUs.find(singleProduct => singleProduct?.competitor_asin === checkInfo2)


        if (filteredFromCa !== undefined && filteredFromCa !== null) {
            const filteredFromCaValue = Object.values(filteredFromCa)[0]
            const filteredFromCaValue2 = filteredFromCaValue;
            if (filteredFromCa) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_ca" where competitor_asin = '${filteredFromCaValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };

                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromEs !== undefined && filteredFromEs !== null) {
            const filteredFromEsValue = Object.values(filteredFromEs)[0]
            const filteredFromEsValue2 = filteredFromEsValue;
            if (filteredFromEs) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_es" where competitor_asin = '${filteredFromEsValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };

                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromFr !== undefined && filteredFromFr !== null) {
            const filteredFromFrValue = Object.values(filteredFromFr)[0]
            const filteredFromFrValue2 = filteredFromFrValue;
            if (filteredFromFr) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_fr" where competitor_asin = '${filteredFromFrValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };
                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromGb !== undefined && filteredFromGb !== null) {
            const filteredFromGbValue = Object.values(filteredFromGb)[0]
            const filteredFromGbValue2 = filteredFromGbValue;
            if (filteredFromGb) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_gb" where competitor_asin = '${filteredFromGbValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };

                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromIt !== undefined && filteredFromIt !== null) {
            const filteredFromItValue = Object.values(filteredFromIt)[0]
            const filteredFromItValue2 = filteredFromItValue;
            if (filteredFromIt) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_it" where competitor_asin = '${filteredFromItValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };
                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromJp !== undefined && filteredFromJp !== null) {
            const filteredFromJpValue = Object.values(filteredFromJp)[0]
            const filteredFromJpValue2 = filteredFromJpValue;
            if (filteredFromJp) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_jp" where competitor_asin = '${filteredFromJpValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };
                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
        else if (filteredFromUs !== undefined && filteredFromUs !== null) {
            const filteredFromUsValue = Object.values(filteredFromUs)[0]
            const filteredFromUsValue2 = filteredFromUsValue;
            if (filteredFromUs) {
                const queryCa = `select scrape_date_time_ts, country, competitor_asin, keyword, Title, Image_URL, organic_rank from "keyword_iq_us" where competitor_asin = '${filteredFromUsValue2}' order by scrape_date_time_ts DESC`;
                const resultOfCa = await pool.query(queryCa);
                const finalResult = {
                    resultOfCa: resultOfCa.rows,
                };
                return res.send({ message: 'Success', data: finalResult })
            }
            else {
                return res.send({ error: 'product not found!!' })
            }

        }
    }
})

app.get('/product-data', cache, getRepos);

// redis code end

// signup for creating account

// app.post('/signup', (req, res) => {

//     const token = randomString.generate();
//     const sql = "INSERT INTO shurq_log (`firstName`, `lastName`, `userName`, `email`, `password`, `confirmPassword`, `token`, is_verified ) VALUES (?)";
//     const is_verified = 0;
//     const values = [
//         req.body.firstName,
//         req.body.lastName,
//         req.body.userName,
//         req.body.email,
//         req.body.password,
//         req.body.confirmPassword,
//         token,
//         is_verified
//     ]
//     db.query(sql, [values], (err, data) => {
//         if (err) {
//             return res.json(err);
//         }

//         const mailSubject = 'Mail Verification';
//         const content = `<p>Hi ${req.body.firstName}, please <a href="http://localhost:8000/mail-verification?token=${token}" >Verify</a> your mail.</p>`;
//         sendMail(req.body.email, mailSubject, content)
//         return res.json(data)
//     })
// })


// let storedData;
// login
// app.post('/sigin', (req, res) => {

//     const token = randomString.generate();
//     const sql = "SELECT * FROM shurq_log WHERE `email` = ? AND `password` = ? AND `is_verified` = ?";
//     const is_verified = 1;
//     db.query(sql, [req.body.email, req.body.password, is_verified], (err, data) => {
//         if (err) {
//             return res.json(err);
//         }
//         if (data.length > 0) {
//             storedData = data;
//             return res.json({ data: data, message: 'Success' });
//         }
//         else {
//             return res.json('login failed')
//         }
//     })
// })

// logged user
// app.get('/logged-user', (req, res) => {

//     const sql = `select * FROM shurq_log WHERE is_verified = 1 AND token = ''`
//     db.query(sql, (err, data) => {
//         if (err) {
//             return res.status(500).json({ error: 'Failed to fetch products' });
//         }
//         else {
//             if (storedData) {
//                 res.send(storedData);
//             } else {
//                 res.json({ message: 'No data stored yet' });
//             }
//         }

//     })


// });

// get all keywords
app.get('/all-keywords', async (req, res) => {
    try {
        const sql = `SELECT * FROM shurq_user`;

        const { rows } = await pool.query(sql);

        if (rows.length > 0) {
            res.json(rows);
        } else {
            res.status(404).json({ error: 'No products found' });
        }
    } catch (error) {
        console.error('Error executing PostgreSQL query:', error.message);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

app.post('/add-keyword', async (req, res) => {
    try {
        const query = req.body;

        const sql = `
            INSERT INTO shurq_user 
            ("title", "country", "keywords", "organic_rank", "image_url", "competitor_asin", "scrape_date_time_ts")
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            query.title || '',
            query.country || '',
            query.keywords || '',
            query.organicRank || '',
            query.imageUrl || '',
            query.competitorAsin || '',
            query.scrapeDateTimeTs || ''
        ];
        return res.json(rows);
    } catch (error) {
        console.error('Error executing PostgreSQL query:', error.message);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

// app.post('/add-keyword', (req, res) => {
//     const query = req.body;

//     const sql = "INSERT INTO shurq_amazon_add_product (`user_email`, `title`, `country`, `keywords`, `organic_rank`, `image_url`, `competitor_asin`, `scrape_date_time_ts` ) VALUES (?)";
//     const values = [
//         req.body.userEmail || '',
//         req.body.title || '',
//         req.body.country || '',
//         req.body.keywords || '',
//         req.body.organicRank || '',
//         req.body.imageUrl || '',
//         req.body.competitorAsin || '',
//         req.body.scrapeDateTimeTs || '',

//     ]
//     db.query(sql, [values], (err, data) => {
//         if (err) {
//             return res.json(err);
//         }

//         return res.json(data)
//     })
// })


app.listen(port, () => {
    console.log(`authentication backed working perfectly on port ${port}`);
})
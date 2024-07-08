const {db} = require('../routes/userRoute')

const verifyMail = (req, res) => {
    const token = req.query.token;

    db.query('SELECT * FROM shurq_log where token=? limit 1', token, function(error, result, fields){
        if(error) {
            console.log(error.message);
        }
        if(result.length > 0) {
            db.query(`UPDATE shurq_log SET token = '', is_verified = 1 WHERE id='${result[0].id}'`)

            return res.render('mail-verification', {message: 'Email Verified Successfully!!'})
        }
        else {
            return res.render('404')
        }
    })

}



module.exports = {
    verifyMail
}
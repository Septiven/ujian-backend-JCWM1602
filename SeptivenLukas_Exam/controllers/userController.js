// Import Connection
const db = require('../connection/connection')

// Import Helpers
const hashPassword = require('../helpers/Hash') 
const validator = require('validator')
const uid = require('../helpers/uid')

const jwt = require('jsonwebtoken')
const uidCode = require('../helpers/uid')



// register
const register = (req, res) => {
    try {
        // Step1. Get all data dari FE
        const data = req.body

        // Step2. Validasi data & buat token
        if(!data.username ||!data.email || !data.password) throw { message: 'Data Must Be Filled' }

        if(data.username.length < 6)throw {message: 'Username length minimal 6 characters'}

        if(!(validator.isEmail(data.email))) throw { message: 'Email Invalid' }

        if(data.password.length < 6 ) throw { message: 'Password Length minimal 6 characters' }
        
        // Step3. Hash data password
        try {
            const passwordHashed = hashPassword(data.password) 
            data.password = passwordHashed

            //token
            jwt.sign({email: data.email, password: passwordHashed}, '123abc', (err, token) => {
                try {
                    if(err) throw err
            
                    let newDataToSend = {
                        email: data.email,
                        password: passwordHashed,
                        username: data.username,
                        token: token,
                        uid: uid(),
                        role: 2,
                        status: 1
                    }
                    
                // Step4. Store data ke DB
                let query = 'SELECT * FROM users WHERE email = ?'
                db.query(query, data.email, (err, result) => {
                    try {
                        if(err) throw err

                        if(result.length === 0){
               
                        db.query('INSERT INTO users SET ?', newDataToSend, (err, result) => {
                            try {
                                if(err) throw err
                                
                                db.query(`SELECT id,uid,username,email,token FROM users WHERE email = '${data.email}'`,(err,result)=>{
                                    try{
                                        if (err) throw err
                                        res.status(200).send({
                                            result
                                        })
                                    }catch (error) {
                                        res.status(500).send({
                                            error: true,
                                            message: "User not found"
                                        })
                                    }
                                })

                            } catch (error) {
                                res.status(500).send({
                                    error: true,
                                    message: "register failed"
                                })
                            }
                        })
                    }else{
                        res.status(200).send({
                            error: true,
                            message: 'Email Already Exist'
                        })
                    }
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: error.message
                            })
                        }
                    })
                } catch (error) {
                    res.status(500).send({
                        error: true,
                        message: 'Token error'
                    })
                }
            })
        } catch (error) {
            res.status(500).send({
                error: true,
                message: 'Failed to Hash Password'
            })
        }   
    } catch (error) {
        res.status(406).send({
            error: true, 
            message: error.message
        })
    }
}

// login
const login = (req, res) => {
    try {
        // Step1. Get All Data
        const data = req.body
        
        // Step2. Validasi Data 
        if((!data.email || !data.password)&&(!data.username || !data.password)) throw { message: 'Data Must Be Filled' }
        
        // Step3. Hash Password Untuk Mencocokan Data Dengan yg Ada di DB
        const passwordHashed = hashPassword(data.password)

        // Step4. Cari Email & Password
        db.query(`SELECT * FROM users WHERE (email = '${data.email}' AND password = '${passwordHashed}') OR (username = '${data.username}' AND password = '${passwordHashed}') AND NOT status = 2`,(err, result) => {
            try {
                if(err) throw err

                if(result.length === 1){
                    db.query(`SELECT id,uid,username,email,status,role,token FROM users WHERE (email = '${data.email}' AND password = '${passwordHashed}') OR (username = '${data.username}' AND password = '${passwordHashed}') AND status = 1`,(err,result2)=>{
                        try {
                            if(err) throw err

                            res.status(200).send({
                                error: false,
                                message: result2[0]
                            })
                        } catch (error) {
                            res.status(500).send({
                                error: true,
                                message: 'failed to get user'
                            })
                        }
                    })                   
                }else{
                    res.status(200).send({
                        error: true,
                        message: 'Email & Password Does Not Match or your acc is not active yet'
                    })
                }
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: error.message
                })
            }
        })
    } catch (error) {
        res.status(406).send({
            error: true,
            message: "status is not active"
        })
    }
}

const deactive = (req,res)=>{
    const token = req.body.token

    db.query(`SELECT * FROM users WHERE token = '${token}' AND NOT status = 3 `,(err,result)=>{
        try{
            if(err) throw err
            
            db.query(`UPDATE users SET status = 2 WHERE token = '${token}'`,(err,result)=>{
                try{
                    if(err) throw err
                    
                    db.query(`SELECT uid FROM users WHERE token = '${token}'`,(err,result)=>{
                        try{
                            if (err) throw err
                            res.status(200).send({
                                uid: result[0].uid,
                                status: "deactive"
                            })
                        }catch{
                            res.status(500).send({
                                error: true,
                                message: "token not found"
                            })
                        }                      
                    })
                }catch{
                    res.status(500).send({
                        error: true,
                        message: "deactivation failed"
                    })
                }
            })
        }catch{
            res.status(404).send({
                error: true,
                message: err.message
            })
        }
    })
}

const activate = (req,res)=>{
    const token = req.body.token

    db.query(`SELECT * FROM users WHERE token = '${token}'  AND NOT status = 3`,(err,result)=>{
        try{
            if(err) throw err
            db.query(`UPDATE users SET status = 1 WHERE token = '${token}'`,(err,result)=>{
                try{
                    if(err) throw err
                    
                    db.query(`SELECT uid FROM users WHERE token = '${token}'`,(err,result)=>{
                        try{
                            if (err) throw err
                            res.status(200).send({
                                uid: result[0].uid,
                                status: "active"
                            })
                        }catch{
                            res.status(500).send({
                                error: true,
                                message: "token not found"
                            })
                        }                      
                    })
                }catch{
                    res.status(500).send({
                        error: true,
                        message: "activation failed"
                    })
                }
            })
        }catch{
            res.status(404).send({
                error: true,
                message: 'token not found or already closed'
            })
        }
    })
}

const close = (req,res)=>{
    const token = req.body.token

    db.query(`SELECT * FROM users WHERE token = '${token}' AND NOT status = 3`,(err,result)=>{
        try{
            if(err) throw err
            db.query(`UPDATE users SET status = 3 WHERE token = '${token}'`,(err,result)=>{
                try{
                    if(err) throw err
                    
                    db.query(`SELECT uid FROM users WHERE token = '${token}'`,(err,result)=>{
                        try{
                            if (err) throw err
                            res.status(200).send({
                                uid: result[0].uid,
                                status: "closed"
                            })
                        }catch{
                            res.status(500).send({
                                error: true,
                                message: "token not found"
                            })
                        }                      
                    })
                }catch{
                    res.status(500).send({
                        error: true,
                        message: "activation failed"
                    })
                }
            })
        }catch{
            res.status(404).send({
                error: true,
                message: 'token not found or already active'
            })
        }
    })
}

module.exports = {
    register: register,
    login: login,
    deactive: deactive,
    activate: activate,
    close: close
}
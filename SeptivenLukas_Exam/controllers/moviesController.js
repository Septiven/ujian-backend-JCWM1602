// Import Connection
const db = require('../connection/connection')

const getall = (req,res) =>{
    db.query(`SELECT * FROM movies WHERE status IS NOT NULL`,(err,result)=>{
        try{
            if(err)throw err

            res.status(200).send({
                result
            })

        }catch (error) {
            res.status(500).send({
                error: true,
                message: "get all movies failed"
            })
        }
    })
}

const get = (req,res) =>{
    const random = req.params.random
    console.log(random)

    db.query(`SELECT * FROM movies WHERE status = 1 OR status = 2`,(err,result)=>{
        try{
            if (err) throw err
            
            res.status(200).send({
                error:false,
                message: result
            })

        }catch(err){
            res.status(500).send({
                error: true,
                message: err.message
            })
        }
    })
}

const adminCreate = (req,res)=>{
    const data = req.body
    const token = req.body.token
    
    db.query(`SELECT * FROM users WHERE token = '${token}'`,(err,result)=>{
        try{
        if(result[0].role !== 1) throw {message:'You are not admin!'}
        if((!data.name)||(!data.genre)||(!data.release_date)||(!data.release_month)||(!data.release_year)||(!data.duration_min)||(!data.description))throw{message:'filled all data!'}
        
        let dataToInsert = {
            name: data.name,
            genre: data.genre,
            release_date: data.release_date,
            release_month: data.release_month,
            release_year: data.release_year,
            duration_min: data.duration_min,
            description: data.description
        }
        db.query(`INSERT INTO movies SET ?`, dataToInsert, (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    message: dataToInsert
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: 'Create movies Failed'
                })
            }
        })
    }catch(err){
        res.status(500).send({
            error:true,
            message: err.message
        })
    }
    })
}


const adminPatchStatus = (req,res)=>{
    const idMovies = req.params.idMovies
    const token = req.body.token
    const data = req.body
    
    db.query(`SELECT * FROM users WHERE token = '${token}'`,(err,result)=>{
        try{
        if(result[0].role !== 1) throw {message:'You are not admin!'}
        if((!data.status)||(!data.token))throw{message:'filled all data!'}
        
        db.query(`UPDATE movies SET status = '${data.status}' WHERE id = '${idMovies}'`, (err, result) => {
            try {
                if(err) throw err

                res.status(200).send({
                    error: false,
                    id: idMovies,
                    message: 'status has been changed'
                })
            } catch (error) {
                res.status(500).send({
                    error: true,
                    message: 'failed to changes status'
                })
            }
        })
    }catch(err){
        res.status(500).send({
            error:true,
            message: err.message
        })
    }
    })
}


const addSchedule = (req,res)=>{
    const idMovies = req.params.idMovies
    const token = req.body.token
    const data = req.body
    
    db.query(`SELECT * FROM users WHERE token = '${token}'`,(err,result)=>{
        try{
        if(result[0].role !== 1) throw {message:'You are not admin!'}
        if((!data.location_id)||(!data.time_id)||(!data.token))throw{message:'filled all data!'}
        
        db.query(`SELECT * FROM movies m JOIN schedules s ON m.id = s.movie_id WHERE m.id = '${idMovies}'`,(err,result)=>{
            try{
                if (err) throw err

                let datatosend = {
                    movie_id: idMovies,
                    location_id: data.location_id,
                    time_id: data.time_id
                }
                
                    db.query(`INSERT INTO schedules SET ?`,datatosend,(err,result)=>{
                        try{
                            if(err)throw err
                            res.status(200).send({
                                error:false,
                                id: idMovies,
                                message: 'schedule has been added'
                            })
                        }catch(error){
                            res.status(500).send({
                                error:true,
                                message:error.message
                            })
                        }
                    })
                
            }catch(err){
                res.status(500).send({
                    error:true,
                    message: err.message
                })
            }
        })

    }catch(err){
        res.status(500).send({
            error:true,
            message: err.message
        })
    }
    })
}

module.exports = {
    getall: getall,
    get: get,
    adminCreate: adminCreate,
    adminPatchStatus: adminPatchStatus,
    addSchedule: addSchedule
}
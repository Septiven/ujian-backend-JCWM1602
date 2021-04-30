const express = require('express')
const Router = express.Router()

const moviesController = require('./../controllers/moviesController') 

Router.get('/get/all', moviesController.getall)
Router.get('/get/:random', moviesController.get)
Router.post('/add', moviesController.adminCreate)
Router.patch('/edit/:idMovies', moviesController.adminPatchStatus)
Router.post('/set/:idMovies', moviesController.addSchedule)

module.exports = Router 
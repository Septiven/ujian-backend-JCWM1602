const express = require('express')
const Router = express.Router()

const userController = require('./../controllers/userController') 

Router.post('/register', userController.register)
Router.post('/login', userController.login)
Router.patch('/deactive', userController.deactive)
Router.patch('/activate', userController.activate)
Router.patch('/close', userController.close)

module.exports = Router
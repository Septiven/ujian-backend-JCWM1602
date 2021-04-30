const express = require('express')
const cors = require('cors')
const bodyparser = require('body-parser')

// main app
const app = express()

// apply middleware
app.use(cors())
app.use(bodyparser.json())

// Import Router
const userRouter = require('./routers/userRouter')
const moviesRouter = require('./routers/moviesRouter')

// main route
const response = (req, res) => res.status(200).send('<h1>REST API JCWM1602</h1>')
app.get('/', response)

app.use('/user', userRouter)
app.use('/movies', moviesRouter)

// bind to local machine
const PORT = process.env.PORT || 2000
app.listen(PORT, () => `CONNECTED : port ${PORT}`)
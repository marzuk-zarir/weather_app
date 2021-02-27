const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const app = express()
const PORT = process.env.PORT || 5555

app.use(cors())
app.use(express.static('./public'))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use('/history', require('./api/route'))

app.listen(PORT, () => {
    console.log(`I am running on http://localhost:${PORT}/`)
    mongoose.connect(
        '', // your remote database URL...
        { useNewUrlParser: true },
        () => console.log('Database Connected')
    )
})

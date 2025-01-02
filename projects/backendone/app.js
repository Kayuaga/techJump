require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
console.log(port, 'PORT 1 and other namespace')

app.get('/', (req, res) => {
    res.json({ hello:'Hello World! backend 1! and other name space' })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
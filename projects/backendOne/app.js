require('dotenv').config()
const express = require('express')
const app = express()
const port = process.env.PORT
console.log(port, 'PORT 1')

app.get('/', (req, res) => {
    res.json({ hello:'Hello World! backend 1!' })
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
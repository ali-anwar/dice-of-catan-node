const express = require('express')
const Dice = require('./dice')
const app = express()
const port = 3000

app.get('/dice/new', (req, res) => {
  var dice = new Dice()
  res.send(`New dice: ${dice.id()}`)
})

app.get('/', (req, res) => {
  res.send('Welcome to Dice of Catan!')
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))

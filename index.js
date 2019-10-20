'use strict';

const express = require('express');
const Dice = require('./dice');
const app = express();
const port = 4337;

var jsonError = message => {
  return {
    error: message,
  };
};

app.get('/dice/new', (req, res) => {
  var dice = new Dice();
  res.json({id: dice.id()});
});

app.get('/dice/:diceID/roll', (req, res) => {
  var dice = Dice.find(req.params.diceID);

  if (dice) {
    res.send(dice.multiRoll());
  } else {
    res.status(404).json(jsonError('Dice not found'));
  }
});

app.get('/', (req, res) => {
  res.send('Welcome to Dice of Catan!');
});

app.listen(port, () => console.log(`Dice on Catan listening on port ${port}!`));

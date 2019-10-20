var fs = require("fs")
var uuid = require('uuid');

class Dice {
  constructor(id) {
    this.initializeCounts();

    if(id) {
      this.uniqueID = id;
      this.readCounts();
    } else {
      this.uniqueID = uuid.v4();
      this.saveCounts();
    }
  }

  initialCount() {
    return 10;
  }

  initializeCounts() {
    this.counts = this.initialCounts();
    this.sum = this.counts.reduce((a, b) => a + b, 0);
  }

  static find(id) {
    var dice = new Dice(id);

    if(dice.valid) {
      return dice;
    }

    return null;
  }

  pureRandom(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  gotNumber(number) {
    var index = number - this.minForDice();

    this.counts[index] += 1;
    this.sum += 1;
    this.saveCounts()
  }

  minForDice() {
    return 2;
  }

  maxForDice() {
    return 12;
  }

  nextNumber() {
    var number = this.pureRandom(this.minForDice(), this.maxForDice());

    this.gotNumber(number);

    return number;
  }

  splitNumber(number) {
    var dice1Number = this.pureRandom(1, number - 1);
    var dice2Number = number - dice1Number;

    if(this.pureRandom(0, 1) == 0) {
      return [dice1Number, dice2Number];
    }

    return [dice2Number, dice1Number];
  }

  roll() {
    var dice1Number, dice2Number, nextNumber = this.nextNumber();

    [dice1Number, dice2Number] = this.splitNumber(nextNumber);

    return {
      dice1: dice1Number,
      dice2: dice2Number,
      sum: nextNumber
    };
  }

  countsFilePath() {
    return `counts/${this.id()}.json`;
  }

  data() {
    return {
      sum: this.sum,
      counts: this.counts
    }
  }

  countsToJson() {
    return JSON.stringify(this.data());
  }


  readCounts() {
    try {
      var data = fs.readFileSync(this.countsFilePath());
      var diceData = JSON.parse(data);

      this.counts = diceData['counts']
      this.sum = diceData['sum']
      this.valid = true;
    } catch(err) {
      console.error(err);
    }
  }

  saveCounts() {
    try {
      fs.writeFileSync(this.countsFilePath(), this.countsToJson());
      this.valid = true;
    } catch(err) {
      console.error(err);
    }
  }

  initialCounts() {
    var i;
    var counts = [];

    for (i = 0; i < this.maxForDice(); i++) {
      counts.push(this.initialCount());
    }

    return counts;
  }

  id() {
    return this.uniqueID;
  }
}

module.exports = Dice;

'use strict';

var fs = require('fs');
var uuid = require('uuid');

class Dice {
  constructor(id) {
    this.initialize();

    if (id) {
      this.uniqueID = id;
      this.readData();
    } else {
      this.uniqueID = uuid.v4();
      this.saveData();
    }
  }

  initialCount() {
    return 10;
  }

  initialize() {
    this.data = {
      counts: this.initialCounts(),
      history: this.initialCounts(0),
      totalRolls: 0,
    };
  }

  static find(id) {
    var dice = new Dice(id);

    if (dice.valid) {
      return dice;
    }

    return null;
  }

  pureRandom(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  maxMinCount() {
    return 15;
  }

  normalizeCounts() {
    var i;
    var min = Math.min(...this.data.counts);

    if (min > this.maxMinCount()) {
      for (i = 0; i < this.totalPossibleNumbers(); i++) {
        this.data.counts[i] = Math.floor(
          this.data.counts[i] * this.initialCount() / this.maxMinCount()
        );
      }
    }
  }

  gotNumber(number) {
    var index = number - this.minForDice();

    this.data.counts[index] += 1;
    this.data.history[index] += 1;
    this.data.totalRolls += 1;

    this.normalizeCounts();
  }

  minForDice() {
    return 2;
  }

  maxForDice() {
    return 12;
  }

  maxCount() {
    return 100;
  }

  numberProbabilities() {
    var i; var sum = 0;
    var probabilities = [];

    for (i = 0; i < Math.ceil(this.totalPossibleNumbers() / 2.0); i++) {
      sum += 1;
      probabilities[i] = sum;
      probabilities[this.totalPossibleNumbers() - i - 1] = sum;
    }

    return probabilities;
  }

  totalPossibleNumbers() {
    return this.maxForDice() - this.minForDice() + 1;
  }

  generateModel() {
    var i, value;
    var probabilities = this.numberProbabilities();
    var model = [];

    for (i = 0; i < this.totalPossibleNumbers(); i++) {
      value = Math.ceil(
        this.maxCount() * probabilities[i] / this.data.counts[i]
      );
      model.push(value);
    }

    return model;
  }

  nextNumberFromModel() {
    var i;
    var model = this.generateModel();
    var sum = model.reduce((a, b) => a + b, 0);
    var pureRandomNumber = this.pureRandom(0, sum);

    sum = 0;
    for (i = 0; i < this.totalPossibleNumbers(); i++) {
      sum += model[i];
      if (pureRandomNumber < sum) {
        return this.minForDice() + i;
      }
    }

    throw new Error('Our pure random number does not fall within the model');
  }

  nextNumber() {
    var number = this.nextNumberFromModel();

    this.gotNumber(number);

    return number;
  }

  splitNumber(number) {
    var dice1Number = this.pureRandom(1, number);
    var dice2Number = number - dice1Number;

    if (this.pureRandom(0, 2) === 0) {
      return [dice1Number, dice2Number];
    }

    return [dice2Number, dice1Number];
  }

  roll() {
    var dice1Number; var dice2Number; var nextNumber = this.nextNumber();

    [dice1Number, dice2Number] = this.splitNumber(nextNumber);

    return {
      dice1: dice1Number,
      dice2: dice2Number,
      sum: nextNumber,
    };
  }

  batchSize() {
    return 100;
  }

  multiRoll() {
    var i;
    var rolls = [];

    for (i = 0; i < this.batchSize(); i++) {
      rolls.push(this.roll());
    }

    this.saveData();

    return {
      rolls: rolls,
      history: this.data.history,
    };
  }

  dataFilePath() {
    return `counts/${this.id()}.json`;
  }

  dataToJson() {
    return JSON.stringify(this.data);
  }


  readData() {
    try {
      var data = fs.readFileSync(this.dataFilePath());

      this.data = JSON.parse(data);
      this.valid = true;
    } catch (err) {
      console.error(err);
    }
  }

  saveData() {
    try {
      fs.writeFileSync(this.dataFilePath(), this.dataToJson());
      this.valid = true;
    } catch (err) {
      console.error(err);
    }
  }

  initialCounts(initialValue = this.initialCount()) {
    var i;
    var counts = [];

    for (i = 0; i < this.totalPossibleNumbers(); i++) {
      counts.push(initialValue);
    }

    return counts;
  }

  id() {
    return this.uniqueID;
  }
}

module.exports = Dice;

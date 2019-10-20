var fs = require("fs")

class Dice {
  constructor() {
    var uuid = require('uuid');
    this.uniqueID = uuid.v4();
    this.counts = this.initialCounts();
    this.saveCounts();
  }

  countsFilePath() {
    return `counts/${this.id()}.json`;
  }

  data() {
    return {
      data: this.counts
    }
  }

  countsToJson() {
    return JSON.stringify(this.data());
  }

  saveCounts() {
    fs.writeFile(this.countsFilePath(), this.countsToJson(), function(err) {
      if (err) {
        return console.error(err);
      }
    });
  }

  initialCounts() {
    return [0, 0, 0, 0, 0, 0, 0,0 ,0, 0, 0];
  }

  id() {
    return this.uniqueID;
  }
}

module.exports = Dice;

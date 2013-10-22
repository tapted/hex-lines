/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * @constructor
 * @param {number} boardSize TODO.
 * @param {number} numNewOrbs TODO.
 * @param {number} minRemoveOrb TODO.
 */
function Game(boardSize, numNewOrbs, minRemoveOrb) {
  /** @const @type {number} */
  this.MAX_COLORS = 11;
  /** @const @type {number} */
  this.numNewOrbs = numNewOrbs;
  /** @const @type {number} */
  this.minRemoveOrb = minRemoveOrb;

  /** @type {Board} */
  this.board = new Board(boardSize);
  /** @type {Score} */
  this.score = new Score();
  /** @type {Hex} */
  this.selectedOrbHex = null;
  /** @type {Hex} */
  this.destinationHex = null;
  /** @type {GridCoordinate} */
  this.mouseOverPos = new GridCoordinate(-1, -1);
  /** @type {Array.<Orb>} */
  this.newOrbs = [];
  /** @type {Array.<Hex>} */
  this.newOrbHexes = [];
  /** @type {Array.<Pixel>} */
  this.newOrbPos = [];

  /** @const @type {number} */
  this.level = setDifficulty();

  /** @type {number} */
  this.turnCounter = -3;

  this.level.numColors += addColors();
  Grid.initialize();
  for (var i = 0; i < numNewOrbs; i++) {
    this.newOrbPos[i] = new Pixel((i + 0.5) * (Hex.ORB_RADIUS * 2 + 10),
                                  Hex.ORB_RADIUS + 10);
  }
}

/**
 * @author Yeri
 * @return {boolean} TODO.
 */
Game.checkFirstNewOrbs = function() {
  for (var i in Main.game.newOrbs) {
    if (Main.game.newOrbs[i].type !== 'Fixed') {
      return true;
    }
  }
  return false;
};

/**
 * @author Both
 */
Game.prototype.startGame = function() {
  setDifficulty();
  addColors();
  displayLocalScoreBoard();
  this.board.initialize();
  do {
    this.generateNewOrbs();
  } while (!Game.checkFirstNewOrbs());
  Anim.idle = true;
  this.placeNewOrbs();
};

/**
 * @author Lauren
 */
Game.prototype.drawNewOrbs = function() {
  if (Anim.animating === 'newOrb') {
    for (var i = 0; i < this.numNewOrbs; i++) {
      drawEmptyOrb(this.newOrbPos[i]);
    }
  }
  for (var i = 0; i < this.numNewOrbs; i++) {
    this.newOrbs[i].draw(this.newOrbs[i].center, false, false);
  }
};

/**
 * @author Lauren
 */
Game.prototype.drawGame = function() {
  this.board.draw();
  this.drawNewOrbs();
  this.score.displayScore();

  /* Level indicator */
  Main.ctx.fillStyle = 'red';
  var ratioWidth = (this.turnCounter % this.level.turnsPerLevel + 1) /
      this.level.turnsPerLevel;
  Main.ctx.fillRect(0, Main.canvas.height - 4,
                    Main.canvas.width * ratioWidth, 4);
};

/**
 * @author Lauren
 */
Game.prototype.generateNewOrbs = function() {
  this.newOrbs = [];
  ++this.turnCounter;
  if (this.turnCounter > 1 &&
      this.turnCounter % this.level.turnsPerLevel == 0) {
    if (Main.game.level.numColors < this.MAX_COLORS)
      ++Main.game.level.numColors;
  }
  for (var i = 0; i < this.numNewOrbs; i++) {
    var newOrb = this.generateOrb();
    newOrb.center = this.newOrbPos[i];
    this.newOrbs.push(newOrb);
  }
};

/**
 * @author Lauren
 */
Game.prototype.placeNewOrbs = function() {
  dlog('in placeNewOrbs');
  if (this.board.numFreeSpaces() < 3) {
    endGame();
    return;
  }
  this.newOrbHexes = [];
  var hex;
  for (var i in this.newOrbs) {
    hex = this.board.placeOrb(this.newOrbs[i]);
    this.newOrbHexes.push(hex);
  }
  dlog('startNewOrbAnim');
  Anim.startNewOrbAnim();
};

/**
 * @author Both
 * @return {Orb} TODO.
 */
Game.prototype.generateOrb = function() {
  var orbColors = ['Red',
                    'Green',
                    'Blue',
                    'Grey',
                    'Yellow',
                    'Purple',
                    'Cyan',
                    'LimeGreen',
                    'Pink',
                    'Orange',
                    'Brown'
                    ];
  var specialTypes = ['Wild', 'Exploder', 'Exploder', 'Destroyer'];
  var color = randBetween(0, Main.game.level.numColors - 1);
  var rand = randBetween(1, 10);

  if (rand <= this.level.normalOrbProbs) {
    return new Orb(orbColors[color], 'Normal');
  } else if (rand <= this.level.fixedOrbProbs + this.level.normalOrbProbs) {
    return new Orb(orbColors[color], 'Fixed');
  } else {
    var type = randBetween(0, specialTypes.length - 1);
    if (specialTypes[type] === 'Wild') {
      return new Orb('Wild', 'Normal');
    } else {
      return new Orb(orbColors[color], specialTypes[type]);
    }
  }
};

/**
 * @author Lauren
 */
Game.prototype.checkIfNewOrbsMadeMatches = function() {
  var toBeRemoved = [], temp, score = [];
  // A randomly placed orb could create a line, so check for matches again.
  // Matches must be checked at each of the places where new orbs entered.
  for (var i = 0; i < this.numNewOrbs; i++) {
    temp = checkForMatchingLines(this.newOrbHexes[i]);
    toBeRemoved = toBeRemoved.concat(temp);
    score = score.concat(Anim.scoreToAdd);
  }
  Anim.scoreToAdd = score;
  if (toBeRemoved.length > 0) {
    Anim.removeAnimHexes = toBeRemoved;
    Anim.ScoreToAdd = score;
    Anim.startRemoveAnim();
  } else {
    if (this.board.numFreeSpaces() === 0 || !this.checkPossibleMove()) {
      endGame();
      return;
    }
  }
};

/**
 * @author Yeri
 * @return {boolean} True if there is a possible move.
 */
Game.prototype.checkPossibleMove = function() {
  var adjacents;

  for (var i in this.board.hexMap) {
    if (this.board.hexMap[i].orb !== null &&
        this.board.hexMap[i].orb.type !== 'Fixed') {
      adjacents = this.board.hexMap[i].getAdjacentHexes();
      for (var j in adjacents) {
        if (adjacents[j].orb === null)
          return true;

      }
    }
  }
  return false;
};

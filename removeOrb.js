/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

////////////////////////////////////////////////////////////////////////////////
////////////////// Checking for matching lines of orbs /////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * @author Lauren
 * Returns the next hex in the given direction.
 * Returns false if you run off the board.
 * @param {string} direction TODO.
 * @param {Hex} currentHex TODO.
 * @return {?Hex} TODO.
 */
var getNextOrbInDirection = function(direction, currentHex) {
  var column = currentHex.gridCoordinate.column;
  var row = currentHex.gridCoordinate.row;
  var next;
  switch (direction) {
    case 'up':
      row -= 2;
      break;
    case 'down':
      row += 2;
      break;
    case 'leftUp':
      column--;
      row--;
      break;
    case 'rightDown':
      column++;
      row++;
      break;
    case 'leftDown':
      column--;
      row++;
      break;
    case 'rightUp':
      column++;
      row--;
      break;
  }

  next = Main.game.board.hex(column, row);
  if (next !== undefined) {
    if (Main.game.board.contains(new GridCoordinate(column, row))) {
      if (next.orb !== null) {
        return next;
      }
    }
  }
  return null;
};

/**
 * @author Lauren
 * Takes in the next Hex and the current Hex
 * @param {Hex} next TODO.
 * @param {Hex} current TODO.
 * @return {boolean} TODO.
 */
var checkOrbMatch = function(next, current) {
  if (Main.game.board.contains(next.gridCoordinate)) {
    if (next.orb !== null) {
      if (current.orb.color === next.orb.color || next.orb.color === 'Wild') {
        return true;
      }
    }
  }
  return false;
};

/**
 * @author Lauren
 * Takes in the next orb's color and the current orb's color.
 * @param {string} next TODO.
 * @param {string} current TODO.
 * @return {boolean} TODO.
 */
var checkColorMatch = function(next, current) {
  if (next !== null && current !== null) {
    if (next === current) {
      return true;
    } else if (next === 'Wild' || current === 'Wild') {
      return true;
    }
  }
  return false;
};

/**
 * @author Yeri
 * @param {Array.<Hex>} toBeRemoved TODO.
 * @param {Hex} hex TODO.
 * @return {boolean} TODO.
 */
var checkOnLine = function(toBeRemoved, hex) {
  for (var i = 0; i < toBeRemoved.length; i++) {
    if (toBeRemoved[i].center.x === hex.center.x &&
        toBeRemoved[i].center.y === hex.center.y) {
      return true;
    }
  }
  return false;
};


/**
 * @author Both - created by Yeri, updated by Lauren
 * @param {Hex} originalHex TODO.
 * @return {Array.<Hex>} TODO.
 */
var handleWildOrbs = function(originalHex) {
  var nextHex, totalLineLength;
  var directionNames = ['up',
                        'down',
                        'leftUp',
                        'rightDown',
                        'leftDown',
                        'rightUp'
                        ];
  var directions = [[], [], [], [], [], []];
  var colorToMatch = [];
  var toBeRemoved = [];
  Anim.scoreToAdd = [];

  for (var i = 0; i < directionNames.length; i++) {
    // Get the nextHex.
    nextHex = getNextOrbInDirection(directionNames[i], originalHex);
    // Check if you ran off the board, or if there was no orb.
    while (nextHex) {
      /* If the next orb is wild, just push it and
          continue looking for a colored hex.*/
      if (nextHex.orb.type === 'Wild') {
        directions[i].push(nextHex);
        nextHex = getNextOrbInDirection(directionNames[i], nextHex);
      } else {
        break;
      }
    }
    /* If you found a hex that wasn't wild, set the color to match
        for this direction to be the color of that orb.*/
    if (nextHex) {
      colorToMatch[i] = nextHex.orb.color;
       // Push the nextHex onto the chain aswell.
      directions[i].push(nextHex);
      nextHex = getNextOrbInDirection(directionNames[i], nextHex);
      /* Continue checking orbs in this direction until you run off the board,
          you run into an empty hex, or the next orb doesn't match.*/
      while (nextHex && checkColorMatch(colorToMatch[i],
          nextHex.orb.color)) {
        // Push each matching orb.
        directions[i].push(nextHex);
        nextHex = getNextOrbInDirection(directionNames[i], nextHex);
      }
    } else {
      if (directions[i].length > 0) {
        /* If they were all wild and you ran off the board or came to an empty
            hexagon then it is a whole chain of wilds.*/
        colorToMatch[i] = 'Wild';
      } else {
        // If you didn't find any orbs, there is no color to match.
        colorToMatch[i] = null;
      }
    }
  }

/*At this point you have a stack of matching orbs for each direction,
  not including the original hex. The stacks can include wilds, as wilds match.
  A stack may be all wilds. Each stack also has a variable set to the color of
  the stack - a stack of entirely wilds will be set to 'wild'.
  If there were no orbs in a particular direction,
  the color to match for that direciton will be set to null */

  for (var i = 0; i < 6; i += 2) {
    if (checkColorMatch(colorToMatch[i], colorToMatch[i + 1])) {
      totalLineLength = directions[i].length + directions[i + 1].length + 1;
      if (totalLineLength >= Main.game.minRemoveOrb) {
        // Score based on totalLineLength.
        Anim.scoreToAdd.push(totalLineLength);//score based on totalLineLength
        for (var j = 0; j < directions[i].length; j++) {
          toBeRemoved.push(directions[i][j]);
        }
        for (var j = 0; j < directions[i + 1].length; j++) {
          toBeRemoved.push(directions[i + 1][j]);
        }
      }
    } else {
      for (var j = i; j < i + 2; j++) {
        totalLineLength = directions[j].length + 1;
        if (totalLineLength >= Main.game.minRemoveOrb) {
          Anim.scoreToAdd.push(totalLineLength);
          for (var k = 0; k < directions[j].length; k++) {
            toBeRemoved.push(directions[j][k]);
          }
        }
      }
    }
  }

  var numOrbsMatched = toBeRemoved.length;

  for (var i = 0; i < numOrbsMatched; ++i) {
    if (toBeRemoved[i].orb.type === 'Destroyer') {
      for (var j in Main.game.board.hexMap) {
        var hex = Main.game.board.hexMap[j];
        if (hex.orb === null)
          continue;
        if (hex.orb.color === toBeRemoved[i].orb.color &&
            !checkOnLine(toBeRemoved, hex)) {
          hex.orb.removeBy = 'Destroyer';
          toBeRemoved.push(hex);
        }
      }
    } else if (toBeRemoved[i].orb.type === 'Exploder') {
      var adjacents = toBeRemoved[i].getAdjacentHexes();
      for (var j = 0; j < adjacents.length; ++j) {
        if (adjacents[j].orb !== null &&
            !checkOnLine(toBeRemoved, adjacents[j])) {
          adjacents[j].orb.removeBy = 'Exploder';
          toBeRemoved.push(adjacents[j]);
        }
      }
    }
  }

  if (toBeRemoved.length > 0)
    toBeRemoved.push(originalHex);

  return toBeRemoved;
};

/**
 * @author Both - created by Yeri, updated by Lauren
 * @param {Hex} originalHex TODO.
 * @return {Array.<Hex>} TODO.
 */
var handleNormalOrbs = function(originalHex) {
  var nextHex, totalLineLength, isRemoved = false;
  var directionNames = ['up',
                        'down',
                        'leftUp',
                        'rightDown',
                        'leftDown',
                        'rightUp'
                        ];
  var directions = [[], [], [], [], [], []];
  var toBeRemoved = [];
  var adjacents = null;
  Anim.scoreToAdd = [];

  for (var i = 0; i < directionNames.length; i++) {
    // Get the nextHex.
    nextHex = getNextOrbInDirection(directionNames[i], originalHex);
    /* Continue checking orbs in this direction until you run off the board,
        you run into an empty hex, or the next orb doesn't match.*/
    while (nextHex && checkOrbMatch(nextHex, originalHex)) {
       // Push each matching orb.
      directions[i].push(nextHex);
      nextHex = getNextOrbInDirection(directionNames[i], nextHex);
    }
  }

/*At this point you have a stack of matching orbs for each direction,
  not including the original hex. The stacks can include wilds, as wilds match.
  A stack may be all wilds.*/

  for (var i = 0; i < 6; i += 2) {
    totalLineLength = directions[i].length + directions[i + 1].length + 1;
    if (totalLineLength >= Main.game.minRemoveOrb) {
      // Score based on totalLineLength.
      Anim.scoreToAdd.push(totalLineLength);
      for (var j = 0; j < directions[i].length; j++) {
        toBeRemoved.push(directions[i][j]);
      }
      for (var j = 0; j < directions[i + 1].length; j++) {
        toBeRemoved.push(directions[i + 1][j]);
      }
    }
  }

  if (toBeRemoved.length > 0) {
    toBeRemoved.push(originalHex);
    var numOrbsMatched = toBeRemoved.length;
    for (var i = 0; i < numOrbsMatched; i++) {
      if (toBeRemoved[i].orb.type === 'Destroyer') {
        for (var j in Main.game.board.hexMap) {
          var hex = Main.game.board.hexMap[j];
          if (hex.orb === null)
            continue;

          if (hex.orb.color === toBeRemoved[i].orb.color &&
              !checkOnLine(toBeRemoved, hex)) {
            hex.orb.removeBy = 'Destroyer';
            toBeRemoved.push(hex);
          }

        }
      } else if (toBeRemoved[i].orb.type === 'Exploder') {
        adjacents = toBeRemoved[i].getAdjacentHexes();
        for (var j = 0; j < adjacents.length; j++) {
          if (adjacents[j].orb !== null &&
              !checkOnLine(toBeRemoved, adjacents[j])) {
            adjacents[j].orb.removeBy = 'Exploder';
            toBeRemoved.push(adjacents[j]);
          }
        }
      }
    }
  }
  return toBeRemoved;
};

/**
 * @author Lauren
 * @param {Hex} current TODO.
 * @return {Array.<Hex>} TODO.
 */
var checkForMatchingLines = function(current) {
  var toBeRemoved;
  if (current.orb.color === 'Wild') {
    toBeRemoved = handleWildOrbs(current);
  } else {
    toBeRemoved = handleNormalOrbs(current);
  }
  return toBeRemoved;
};

////////////////////////////////////////////////////////////////////////////////
////////////////// Removing the orbs that were matched /////////////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * @author Lauren
 * @param {Array.<Hex>} toBeRemoved TODO.
 * @param {number} score TODO.
 */
var removeOrbs = function(toBeRemoved, score) {
  var isRemoved = false;
  if (toBeRemoved.length > 0) {
    isRemoved = true;
  }

  for (var i = 0; i < toBeRemoved.length; i++) {
    toBeRemoved[i].orb = null;
  }

  if (isRemoved) {
    Main.game.score.removeCounter += 1;
    Main.game.score.updateScore(score);
  }

  // Place the new orbs if the gameboard is empty.
  if (Main.game.board.hasNoOrbs()) {
    Main.game.placeNewOrbs();
  }
};

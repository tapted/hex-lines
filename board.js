/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

///////////////////////////////////////////////////////////////////////////////
//////////// Creating and drawing the board ///////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * @constructor
 * @param {number} boardSize TODO.
 */
function Board(boardSize) {
  /** @type {number} board size. */
  this.boardSize = boardSize;
  /** @type {number} */
  this.numColumns = 2 * boardSize - 1;
  /** @type {number} */
  this.numRows = 2 * this.numColumns - 1;
  /** @type {number} */
  this.rightColumn = Math.floor(this.numColumns / 2);
  /** @type {number} */
  this.leftColumn = -this.rightColumn;
  /** @type {number} */
  this.bottomRow = Math.floor(this.numRows / 2);
  /** @type {number} */
  this.topRow = -this.bottomRow;
  /** @type {Object.<string, Hex>} */
  this.hexMap = {};
  var hexEdgeLength = Main.canvas.height / (this.numColumns * Math.sqrt(3)) - 1;
  Hex.initializeStaticVars(hexEdgeLength);

  /** @type {Object} */
  this.backgroundGradient = Main.ctx.createRadialGradient(
      Main.canvas.width / 2, Main.canvas.height / 2, 300,
      Main.canvas.width / 2, Main.canvas.height / 2, 500);
  this.backgroundGradient.addColorStop(0, '#FFFFFF');
  this.backgroundGradient.addColorStop(1, '#EBECC9');
}

/**
 * @param {number} c column.
 * @param {number} r row.
 * @return {Hex} hex.
 */
Board.prototype.hex = function(c, r) {
  return this.hexMap[c + ',' + r];
};

/**
 * @param {number} r row.
 * @param {number} c column.
 */
Board.prototype.initHex = function(r, c) {
  this.hexMap[r + ',' + c] = new Hex(new GridCoordinate(r, c));
};

/**Yeri*/
Board.prototype.initialize = function() {
  // The center column of the board is column 0.
  for (var i = -this.boardSize + 1; i <= 0; i++) {
    // Initialize all columns except the center column.
    if (i < 0) {
      for (var j = -(this.numColumns - 1 + i); j <=
          Math.abs(this.numColumns - 1 + i); j += 2) {
        this.initHex(i, j);
        this.initHex(-i, j);
      }
    } else {
       // Initialize the center column.
      for (var j = -(this.numColumns - 1 + i); j <=
          Math.abs(this.numColumns - 1 + i); j += 2) {
        this.initHex(i, j);
      }
    }
  }
};

/**
 * @author Both
 */
Board.prototype.draw = function() {
  Main.ctx.clearRect(0, 0, Main.canvas.width, Main.canvas.height);
  Main.ctx.fillStyle = this.backgroundGradient;
  Main.ctx.fillRect(0, 0, Main.canvas.width, Main.canvas.height);

  for (var i in this.hexMap)
    this.hexMap[i].draw();

  if (Main.game.destinationHex !== null)
    Main.game.destinationHex.draw();

};

/**
 * @author Lauren
 * @return {boolean} Truth.
 */
Board.prototype.hasNoOrbs = function() {
  for (var i in this.hexMap) {
    if (this.hexMap[i].orb !== null)
      return false;
  }

  return true;
};

///////////////////////////////////////////////////////////////////////////////
//////////////////// Click handling on the board //////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Check whether the board contains a hexagon.
 * @author Lauren
 * @param {GridCoordinate} gridCoor TODO.
 * @return {boolean} Truth.
 */
Board.prototype.contains = function(gridCoor) {
  // Check that it is a valid coordinate.
  if (Math.abs(gridCoor.column % 2) === Math.abs(gridCoor.row % 2)) {
    // Check that it is within the board.
    if (Math.abs(gridCoor.column) + Math.abs(gridCoor.row) <=
        2 * this.boardSize - 2) {
      if (gridCoor.column >= this.leftColumn && gridCoor.column <=
          this.rightColumn) {
        return true;
      }
    }
  }
  return false;
};

/**
 * @author Lauren
 * @param {GridCoordinate} gridCoor TODO.
 * @param {boolean} isMouseDown true if mouse down.
 */
Board.prototype.handleClick = function(gridCoor, isMouseDown) {
  if (isMouseDown) {
    this.clearVisited();
    if (Anim.animating === 'path' || Anim.animating === 'remove' ||
        Anim.animating === 'newOrb') {
      Anim.end[Anim.animating]();
    }
  }
  var clickedHex = this.hex(gridCoor.column, gridCoor.row);
  if (clickedHex.orb !== null) {
    if (clickedHex.orb.type === 'Fixed')
      return;  // Can't select.

    if (clickedHex === Main.game.selectedOrbHex) {
      if (isMouseDown)
        Main.game.selectedOrbHex = null;
      return;  // Toggle selection.
    }

    // The orb that was clicked becomes the selected orb.
    Main.game.selectedOrbHex = clickedHex;
    return;  // New selection.
  }

  if (!Main.game.selectedOrbHex)
    return;  // No selection.

  // If the user previously selected a hex, then move the orb.
  Main.game.destinationHex = clickedHex;
  var pathFound = searchPath(Main.game.selectedOrbHex,
                             Main.game.destinationHex);
  Anim.route = pathFound;
  if (pathFound.length == 0)
    return;  // No route.

  if (isMouseDown)
    return;  // Mousedown only for selection.

  Main.game.destinationHex.orb = Main.game.selectedOrbHex.orb;
  Anim.startPathAnim();
  Main.game.selectedOrbHex.orb = null;
  Main.game.selectedOrbHex = null;
};

/**
 * @author Lauren
 * @param {GridCoordinate} gridCoor TODO.
 * @param {Pixel} position TODO.
 * @return {GridCoordinate} TODO.
 */
Board.prototype.convertGridCoor = function(gridCoor, position) {
  if (Math.abs(gridCoor.column % 2) === Math.abs(gridCoor.row % 2)) {
    if (position.isAbove()) {
      gridCoor.column--;
      gridCoor.row--;
    }
  } else {
    if (position.isBelow()) {
      gridCoor.column--;
    } else {
      gridCoor.row--;
    }
  }
  return gridCoor;
};

///////////////////////////////////////////////////////////////////////////////
//////////////////// Generating and placing orbs in the board /////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * @author Lauren
 * @param {Orb} orb TODO.
 * @return {Hex} TODO.
 */
Board.prototype.placeOrb = function(orb) {
  var orbPlaced = false;
  while (!orbPlaced) {
    var gridCoor = Main.game.board.generateRandomGridCoor();
    if (!this.hex(gridCoor.column, gridCoor.row).orb) {
      orbPlaced = true;
      this.hex(gridCoor.column, gridCoor.row).orb = orb;
    }
  }
  return this.hex(gridCoor.column, gridCoor.row);
};

/**
 * @author Lauren
 * @return {GridCoordinate} TODO.
 */
Board.prototype.generateRandomGridCoor = function() {
  var gridCoor = new GridCoordinate(-1, -1);
  do {
    gridCoor.column = randBetween(this.leftColumn, this.rightColumn);
    gridCoor.row = randBetween(this.topRow, this.bottomRow);
  } while (!this.contains(gridCoor));

  return gridCoor;
};

///////////////////////////////////////////////////////////////////////////////
//////////////////// Handling game over ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * @author Lauren
 * @return {number} TODO.
 */
Board.prototype.numFreeSpaces = function() {
  var numFreeSpaces = 0;
  for (var i in this.hexMap) {
    if (!this.hexMap[i].orb)
      numFreeSpaces++;
  }
  return numFreeSpaces;
};

/** */
Board.prototype.clearVisited = function() {
  for (var i in this.hexMap) {
    this.hexMap[i].visited = false;
    this.hexMap[i].parent = null;
    this.hexMap[i].onPath = false;
  }
};

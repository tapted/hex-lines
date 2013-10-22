/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

////////////////////////////////////////////////////////////////////////////////
////////////////// Click and mouseOver handling on the canvas //////////////////
////////////////////////////////////////////////////////////////////////////////

/**
 * @param {Event} mouseClick MouseEvent.
 * @param {boolean} down True if down.
 * @author Lauren
 */
var handleMouseUpOrDown = function(mouseClick, down) {
  var clickPos = getClickPos(mouseClick);
  var gridCoor = Grid.getGridCoor(clickPos);
  var position = Grid.getPosInRectangle(clickPos);
  var boardCoor = Main.game.board.convertGridCoor(gridCoor, position);
  if (Main.game.board.contains(boardCoor)) {
    Main.game.board.handleClick(boardCoor, down);
  }
  Anim.poke();
};

/**
 * @param {Event} mouseClick MouseEvent.
 */
var handleMouseDown = function(mouseClick) {
  handleMouseUpOrDown(mouseClick, true);
};

/**
 * @param {Event} mouseClick MouseEvent.
 */
var handleMouseUp = function(mouseClick) {
  handleMouseUpOrDown(mouseClick, false);
};

/**
 * @param {Event} mousemove MouseEvent.
 * @author Lauren
 */
var handleMouseOver = function(mousemove) {
  var currMousePos = getClickPos(mousemove);
  var gridCoor = Grid.getGridCoor(currMousePos);
  var position = Grid.getPosInRectangle(currMousePos);
  var boardCoor = Main.game.board.convertGridCoor(gridCoor, position);
  if (Main.game.board.contains(boardCoor)) {
    Main.game.mouseOverPos = boardCoor;
    if (Main.game.selectedOrbHex) {
      searchPath(Main.game.selectedOrbHex,
                 Main.game.board.hex(boardCoor.column, boardCoor.row));
    }
  } else {
    Main.game.board.clearVisited();
    Main.game.mouseOverPos = new GridCoordinate(1000, 1000);
  }
  Anim.poke();
};

////////////////////////////////////////////////////////////////////////////////
////////////////// Ending and resetting the game ///////////////////////////////
////////////////////////////////////////////////////////////////////////////////
/** Lauren */
var endGame = function() {
  saveScores(Main.game.score.currentScore);
  Main.game.destinationHex.orb = null;
  Anim.startEndGameAnim();
};

/** Lauren */
var resetGame = function() {
  hideScorePopup();
  Main.game = null;
  Main.game = new Game(getBoardSize(), 3, getMinRemoveOrb());
  displayLocalScoreBoard();
  Main.game.startGame();
  Anim.poke();
};

///////////////////////////////////////////////////////////////////////////////
////////////// Random number generation helper method /////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Returns a random integer between minimum(inclusive) and maximum(inclusive).
 * @param {number} minimum lower bound.
 * @param {number} maximum upper bound.
 * @return {number} random.
 * @author Lauren
 */
var randBetween = function(minimum, maximum) {
  // Swap the arguments if they are passed in the wrong order.
  if (minimum > maximum) {
    var temp = minimum;
    minimum = maximum;
    maximum = temp;
  }
  return Math.floor(Math.random() * (1 + maximum - minimum)) + minimum;
};

///////////////////////////////////////////////////////////////////////////////
/// Draw empty orbs in the top corner when new orbs are entering the board ////
///////////////////////////////////////////////////////////////////////////////

/**
 * @param {Pixel} center centerpoint.
 * @author Lauren
 */
var drawEmptyOrb = function(center) {
  Main.ctx.fillStyle = 'white';
  Main.ctx.lineWidth = 2;
  Main.ctx.beginPath();
  Main.ctx.arc(center.x, center.y, Hex.ORB_RADIUS, 0, 2 * Math.PI);
  Main.ctx.fill();
  Main.ctx.stroke();
};

///////////////////////////////////////////////////////////////////////////////
/////////////////////// Setting up the UI /////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/** Everything from here down was done by Yeri */
var displayLocalScoreBoard = function() {
  chrome.storage.sync.get(null, function(storage) {
    var scores = storage['HighScores'];
    for (var i = 1; i <= scores.length; i++) {
      if (scores[i - 1] !== 0) {
        document.getElementById(i.toString()).innerHTML =
            i + '. ' + scores[i - 1];
      } else {
        document.getElementById(i.toString()).innerHTML = i + '. ';
      }
    }
  });
};

/** @return {number} difficulty. */
var getDifficulty = function() {
  return Number($('difficulty').value);
};

/** @return {boolean} truth. */
var displayAnimations = function() {
  return $('animEffect').value === '0';
};

/** @return {number} board size. */
var getBoardSize = function() {
  return 5;
};

/** @return {number} minimum line length. */
var getMinRemoveOrb = function() {
  return 5;
};

/** */
var applyMinRemoveOrbNow = function() {
  Main.game.minRemoveOrb = getMinRemoveOrb();
};

/** @return {number} animation speed. */
var getAnimSpeed = function() {
  return Number($('animSpeed').value);
};

/**
 * @return {number} number of colors.
 */
var addColors = function() {
  return Number($('numColor').value);
};

/** */
var applyAddColors = function() {
  Main.game.level.numColors = Main.game.level.getDefaultNumColors() +
      addColors();
};

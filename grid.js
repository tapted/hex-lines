/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/*We both implemented different versions of this part,
  and then chose Lauren's in the end.*/

goog.provide('Grid');

/** Initialize. */
Grid.initialize = function() {
  Grid.COL_WIDTH = 1.5 * Hex.EDGE_LENGTH;
  Grid.ROW_HEIGHT = Hex.HALF_HEIGHT;
  Grid.NUM_COLUMNS = Math.floor(Main.canvas.width / Grid.COL_WIDTH);
  Grid.Y_AXIS = Main.gridCenter.x - Hex.EDGE_LENGTH;
  Grid.X_OFFSET = Grid.Y_AXIS - Math.floor(Grid.NUM_COLUMNS / 2) *
      Grid.COL_WIDTH;
};

/**
 * Get grid coordinate for a click.
 * @param {Pixel} clickPos Canvas click position.
 * @return {GridCoordinate} Coordinate.
 */
Grid.getGridCoor = function(clickPos) {
  return new GridCoordinate(Math.floor((clickPos.x - Grid.X_OFFSET) /
                            Grid.COL_WIDTH) - Math.floor(Grid.NUM_COLUMNS / 2),
                            Math.floor(clickPos.y / Grid.ROW_HEIGHT -
                            (Main.game.board.boardSize * 2 - 2)));
};

/**
 * Position in a rectangle?
 * @param {Pixel} clickPos Canvas click position.
 * @return {Pixel} Position.
 */
Grid.getPosInRectangle = function(clickPos) {
  return new Pixel((clickPos.x - Grid.X_OFFSET) %
              Grid.COL_WIDTH, clickPos.y % Grid.ROW_HEIGHT);
};

///////////////////////////////////////////////////////////////////////////////
////////////// Used for click handling ////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
/**
 * @constructor
 * @param {number} column Column.
 * @param {number} row Row.
 */
function GridCoordinate(column, row) {
  this.column = column;
  this.row = row;
}

/**
 * @param {GridCoordinate} rhs Other.
 * @return {boolean} true if equal.
 */
GridCoordinate.prototype.equals = function(rhs) {
  return this.column == rhs.column && this.row == rhs.row;
};

/**
 * @constructor
 * @param {number} x X position.
 * @param {number} y Y position.
 */
function Pixel(x, y) {
  /** @type {number} x */
  this.x = x;
  /** @type {number} y */
  this.y = y;
}

/**
 * Check whether pixel is above the top left edge of the hexagon.
 * @return {boolean} truth.
 */
Pixel.prototype.isAbove = function() {
  var y = -Math.sqrt(3) * this.x + Hex.HALF_HEIGHT;
  return (this.y < y);
};

/**
 * Check whether pixel is below the bottom left edge of the hexagon.
 * @return {boolean} truth.
 */
Pixel.prototype.isBelow = function() {
  var y = Math.sqrt(3) * this.x;
  return (this.y > y);
};

/**
 * @param {Event} mouseClick MouseEvent.
 * @return {Pixel} pixel location.
 */
var getClickPos = function(mouseClick) {
  var click = new Pixel(mouseClick.offsetX * Main.pixelRatio,
                        mouseClick.offsetY * Main.pixelRatio);
  return click;
};

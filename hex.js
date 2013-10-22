/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * @param {string} s string to log.
 */
function dlog(s) {
  //console.log(s);
}

///////////////////////////////////////////////////////////////////////////////
/////////// Set hexagon properties and draw Hexagons //////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * Store the coordinates of hexagons and orb details.
 * @constructor
 * @param {GridCoordinate} gridCoordinate description.
 */
function Hex(gridCoordinate) {
  /** @type {GridCoordinate} grid coordinate. */
  this.gridCoordinate = gridCoordinate;
  /** @type {Pixel} center of hex. */
  this.center = new Pixel(
      Main.gridCenter.x + 3 * gridCoordinate.column * Hex.HALF_EDGE_LENGTH,
      Main.gridCenter.y + gridCoordinate.row * Hex.HALF_HEIGHT);
  /** @type {Orb} current orb, or null if empty */
  this.orb = null;
  /** @type {boolean} */
  this.visited = false;
  /** @type {Hex} */
  this.parent = null;
  /** @type {boolean} */
  this.onPath = false;

  /** @type {Object} */
  this.backgroundGradient = Main.ctx.createRadialGradient(
      this.center.x, this.center.y, 1,
      this.center.x, this.center.y, Hex.EDGE_LENGTH);
  this.backgroundGradient.addColorStop(0.0, '#FFFFFF');
  this.backgroundGradient.addColorStop(0.5, '#F9EE9E');
  this.backgroundGradient.addColorStop(1.0, '#FAAD00');

  /** @type {Object} */
  this.pathGradient = Main.ctx.createRadialGradient(
      this.center.x, this.center.y, 1,
      this.center.x, this.center.y, Hex.EDGE_LENGTH);
  this.pathGradient.addColorStop(0.0, '#ccFFcc');
  this.pathGradient.addColorStop(0.5, '#c9EE80');
  this.pathGradient.addColorStop(1.0, '#d0AD00');
}

/**
 * @param {number} edgeLength TODO.
 */
Hex.initializeStaticVars = function(edgeLength) {
  /** @const @type {number} edge length. */
  Hex.EDGE_LENGTH = edgeLength;
  /** @const @type {number} half edge length. */
  Hex.HALF_EDGE_LENGTH = edgeLength / 2;
  /** @const @type {number} half height. */
  Hex.HALF_HEIGHT = edgeLength * Math.cos(Math.PI / 6);
  /** @const @type {number} orb radius. */
  Hex.ORB_RADIUS = Hex.EDGE_LENGTH * 0.65;
};

/**
 * @author Both
 */
Hex.prototype.draw = function() {
  Main.ctx.beginPath();
  Main.ctx.moveTo((this.center.x - Hex.EDGE_LENGTH), this.center.y);
  Main.ctx.lineTo((this.center.x - Hex.HALF_EDGE_LENGTH),
      (this.center.y - Hex.HALF_HEIGHT));
  Main.ctx.lineTo((this.center.x + Hex.HALF_EDGE_LENGTH),
      (this.center.y - Hex.HALF_HEIGHT));
  Main.ctx.lineTo((this.center.x + Hex.EDGE_LENGTH), this.center.y);
  Main.ctx.lineTo((this.center.x + Hex.HALF_EDGE_LENGTH),
      (this.center.y + Hex.HALF_HEIGHT));
  Main.ctx.lineTo((this.center.x - Hex.HALF_EDGE_LENGTH),
      (this.center.y + Hex.HALF_HEIGHT));
  Main.ctx.lineTo((this.center.x - Hex.EDGE_LENGTH), this.center.y);
  Main.ctx.strokeStyle = 'Black';
  Main.ctx.lineWidth = 2;

  // Mouse over handling for hexagons.
  var mouseOver =
      Main.game.mouseOverPos.column === this.gridCoordinate.column &&
      Main.game.mouseOverPos.row === this.gridCoordinate.row;

  var pathUnderMouse = mouseOver &&
      Main.game.selectedOrbHex !== null &&
      Main.game.selectedOrbHex.orb !== null;

  if (this.onPath) {
    // Highlight green if there is a valid path.
    Main.ctx.fillStyle = pathUnderMouse ? '#94FF70' : this.pathGradient;
  } else {
    // Highlight red if there is no valid path.
    Main.ctx.fillStyle = pathUnderMouse && this.orb === null ?
        '#FF8080' :
        this.backgroundGradient;
  }

  Main.ctx.fill();
  Main.ctx.stroke();
  if (this.orb === null)
    return;

  this.orb.draw(this.orb.center,
                this === Main.game.selectedOrbHex,
                mouseOver);
};

////////////////////////////////////////////////////////////////////////////////
////////////////// Used for finding paths around the board /////////////////////
////////////////////////////////////////////////////////////////////////////////
/**
 * @author Lauren
 * @return {Array.<Hex>} TODO.
 */
Hex.prototype.getAdjacentHexes = function() {
  var adjacents = [];
  var x = this.gridCoordinate.column;
  var y = this.gridCoordinate.row;
  var rc = [[x, y - 2],    // Up.
            [x + 1, y - 1], // Top-right.
            [x + 1, y + 1], // Bottom-right.
            [x, y + 2],     // Down.
            [x - 1, y + 1], // Bottom-left.
            [x - 1, y - 1]];// Top-left.
  for (var i = 0; i < rc.length; i++) {
    var hex = Main.game.board.hex(rc[i][0], rc[i][1]);
    if (hex !== undefined)
      adjacents.push(hex);

  }
  return adjacents;
};

/**
 * @author Yeri
 * @return {boolean} TODO.
 */
Hex.prototype.hasOrb = function() {
  return this.orb !== null;
};

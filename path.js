/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Path finding using Breadth First Search.
 * @param {Hex} start start hex.
 * @param {Hex} goal goal hex.
 * @return {Array.<Hex>} shortest path.
 * @author Yeri
 */
var searchPath = function(start, goal) {
  Main.game.board.clearVisited();
  if (!start.orb)
    return [];

  if (goal.orb)
    return [];

  var list = [start];
  start.visited = true;

  var found = false;
  for (var j = 0; j < list.length && !found; j++) {
    var current = list[j];
    var adjacents = current.getAdjacentHexes();
    for (var i = 0; i < adjacents.length; ++i) {
      var hex = adjacents[i];
      if (hex.visited || hex.hasOrb())
        continue;

      list.push(hex);
      hex.visited = true;
      hex.parent = current;

      if (hex === goal) {
        found = true;
        break;
      }
    }
  }
  if (!found)
    return [];

  var path = [goal];
  var tile = goal;
  while (tile.parent) {
    tile.onPath = true;
    tile = tile.parent;
    path.unshift(tile);
  }
  start.onPath = true;
  return path;
};

/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * Alias for document.getElementById.
 * @param {string} id The ID of the element to find.
 * @return {HTMLElement} The found element or null if not found.
 */
function $(id) {
  return document.getElementById(id);
}

var menuOrigin = '';
var toggleOptions = function() {
  var windowBounds = chrome.app.window.current().getBounds();
  if (menuOrigin == '') {
    menuOrigin = $('menu').style.left;
    $('menu').style.left = '640px';
    $('toggleOptions').value = 'Options <';
    windowBounds.width = 886;
  } else {
    $('menu').style.left = menuOrigin;
    $('toggleOptions').value = 'Options >';
    menuOrigin = '';
    windowBounds.width = 640;
  }
  chrome.app.window.current().setBounds(windowBounds);
};

/** */
var Main = function() {

/** Yeri */
function initialize() {
  /** @type {HTMLElement} drawing canvas */
  Main.canvas = $('myCanvas');
  /** @type {number} pixel ratio of the canvas, for HiDPI */
  Main.pixelRatio = 1.0;

  // Convert canvas to hidpi if necessary.
  var context = Main.canvas.getContext('2d');
  var backingStorePixelRatio = context.webkitBackingStorePixelRatio ||
      context.backingStorePixelRatio;
  var devicePixelRatio = window.devicePixelRatio;
  if (devicePixelRatio !== backingStorePixelRatio) {
    Main.pixelRatio = devicePixelRatio / backingStorePixelRatio;
    var oldWidth = Main.canvas.width;
    var oldHeight = Main.canvas.height;

    Main.canvas.width = oldWidth * Main.pixelRatio;
    Main.canvas.height = oldHeight * Main.pixelRatio;

    Main.canvas.style.width = oldWidth + 'px';
    Main.canvas.style.height = oldHeight + 'px';
  }

  /** @type {RenderingContext} rendering context */
  Main.ctx = Main.canvas.getContext('2d');
  Main.gridCenter = new Pixel(
      Main.canvas.width / 2,
      Main.canvas.height / 2);
  Main.game = new Game(5, 3, getMinRemoveOrb());
  Main.canvas.addEventListener('mousedown', handleMouseDown, false);
  Main.canvas.addEventListener('mouseup', handleMouseUp, false);
  Main.canvas.addEventListener('mousemove', handleMouseOver, false);
  $('difficulty').addEventListener('click',
                                   function() { getDifficulty(); },
                                   false);
  $('numColor').addEventListener('click', function() { addColors(); }, false);
  $('applyColorNow').addEventListener('click', applyAddColors, false);
  $('animEffect').addEventListener('click', displayAnimations, false);
  $('animSpeed').addEventListener('click',
                                  function() { getAnimSpeed(); },
                                  false);
  $('resetScore').addEventListener('click', resetLocalScore, false);
  $('startNewGame').addEventListener('click', resetGame, false);
  $('toggleOptions').addEventListener('click', toggleOptions, false);

  $('instruction').addEventListener('click', function() {
    $('slides').style.left = 0;
  }, false);
  $('pointSystem').addEventListener('click', function() {
    $('slides').style.left = '-250px';
  }, false);
  $('localRanking').addEventListener('click', function() {
    $('slides').style.left = '-500px';
  }, false);
  $('setting').addEventListener('click', function() {
    $('slides').style.left = '-750px';
  }, false);
}

function runGame() {
  Level.defaultSetting();
  initialize();
  initializeHighScores();
  Main.game.startGame();
  Anim.runMainLoop();
}

return {
  runGame: runGame
};

}();
Main.runGame();

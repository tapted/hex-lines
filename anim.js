/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

var Anim = {
  animating: 'regular',
  currentHexIndex: 0,
  nextHexIndex: null,
  animTime: null,
  lastTime: null,
  timeLimit: null,
  pathAnimOrb: null,
  route: null,
  removeAnimHexes: [],
  scoreToAdd: [],
  idle: false,
  resizedWindow: true  // Disabled.
};

/** Animations speeds configuration */
Anim.TIME_CONFIG = [
  //  Animation speed is slow.
  {'path': 500, 'remove': 1500, 'counter': 1000, 'newOrb': 1200, 'end': 15000,
      'resizeWindow': 1000},
  //  Animation Speed is medium.
  {'path': 120, 'remove': 400, 'counter': 300, 'newOrb': 500, 'end': 15000,
      'resizeWindow': 1000},
  //  Animation Speed is fast.
  {'path': 40, 'remove': 200, 'counter': 200, 'newOrb': 200, 'end': 15000,
      'resizeWindow': 1000}
];
///////////////////////////////////////////////////////////////////////////////
////////////// Setup the main game loop ///////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/** @author Both */
Anim.runMainLoop = function() {
  if (!Anim.idle)
    window.webkitRequestAnimationFrame(Anim.runMainLoop);
  Anim.update();
  Anim.draw();
};

/**
 * Unset idle and request the first animation frame.
 * @param {string} animation The animation to run.
 * @param {number} durationFactor Time of the animation.
 */
Anim.wake = function(animation, durationFactor) {
  Anim.animating = animation;
  Anim.timeStarted = new Date().getTime();
  Anim.timeLimit = durationFactor * Anim.TIME_CONFIG[getAnimSpeed()][animation];
  Anim.poke();
};

/**
 * Redraw.
 */
Anim.poke = function() {
  if (!Anim.idle)
    return;
  Anim.idle = false;
  Anim.runMainLoop();
};

/** @author Both */
Anim.draw = function() {
  if (Anim.animating !== 'end') {
    Main.game.drawGame();
    if (Anim.animating === 'counter')
      Main.game.score.displayLineCounter();
  }
};

/** @author Both */
Anim.update = function() {
  if (Anim.timeStarted === null) {  //first time update is called
    Anim.timeStarted = new Date().getTime();
  }
  Anim.animTime = (new Date().getTime()) - Anim.timeStarted;
  if (Anim.animating === 'regular') {
    Anim.idle = true;
    return;
  }

  if (Anim.animTime > Anim.timeLimit) {
    Anim.end[Anim.animating]();
    return;
  }

  if (!displayAnimations()) {
    Anim.animTime = Anim.timeLimit;
    return;
  }

  if (Anim.animating !== 'counter') {
    Anim.step[Anim.animating]();
  } else {
    Anim.start[Anim.animating]();
  }
};

///////////////////////////////////////////////////////////////////////////////
/////// Animating the path of orbs as they move around the board //////////////
///////////////////////////////////////////////////////////////////////////////

/** Path animation done by Yeri */
Anim.startPathAnim = function() {
  Anim.pathAnimOrb = Main.game.selectedOrbHex.orb;
  Anim.wake('path', Anim.route.length - 1);
};

/** Step path */
Anim.stepPathAnim = function() {
  var current = new Pixel(-1, -1);
  var distance = (Anim.animTime / Anim.timeLimit) * (Anim.route.length - 1);
  //  Hex index for current starting position.
  Anim.currentHexIndex = Math.floor(distance);
  Anim.nextHexIndex = Anim.currentHexIndex + 1;
  if (Anim.nextHexIndex < Anim.route.length) {
    var rate = distance - Anim.currentHexIndex;
    if (Anim.currentHexIndex >= 0) {
      Anim.route[Anim.currentHexIndex].onPath = false;
      current.x = Anim.route[Anim.currentHexIndex].center.x * (1 - rate) +
          Anim.route[Anim.nextHexIndex].center.x * rate;
      current.y = Anim.route[Anim.currentHexIndex].center.y * (1 - rate) +
          Anim.route[Anim.nextHexIndex].center.y * rate;
    }
  }

  Anim.pathAnimOrb.setCenter(current);
};

/** End path */
Anim.endPathAnim = function() {
  Main.game.board.clearVisited();
  Anim.currentHexIndex = null;
  Main.game.destinationHex.orb.center = Main.game.destinationHex.center;
  Anim.pathAnimOrb = null;
  var toBeRemoved = checkForMatchingLines(Main.game.destinationHex);
  if (toBeRemoved.length > 0) {
    Anim.removeAnimHexes = toBeRemoved;
    Anim.startRemoveAnim();
  } else {
    Main.game.score.removeCounter = 0;
    Main.game.placeNewOrbs();
  }
};

///////////////////////////////////////////////////////////////////////////////
////////////// Animating orbs as they are removed currentHexIndex the board ///
///////////////////////////////////////////////////////////////////////////////

/** Remove orb animation done by Yeri */
Anim.startRemoveAnim = function() {
  Anim.wake('remove', 1);
};

/** Step remove */
Anim.stepRemoveAnim = function() {
  for (var i = 0; i < Anim.removeAnimHexes.length; i++) {
    Anim.removeAnimHexes[i].orb.radius = Hex.ORB_RADIUS *
        (1 - (Anim.animTime / Anim.timeLimit));
  }
};

/** End remove */
Anim.endRemoveAnim = function() {
  removeOrbs(Anim.removeAnimHexes, Anim.scoreToAdd);
  Anim.wake('counter', 1);
};

///////////////////////////////////////////////////////////////////////////////
////////////// Animating multiple line removes /////////// ////////////////////
///////////////////////////////////////////////////////////////////////////////

/** @author Yeri */
Anim.startComboCounterAnim = function() {
  if (Main.game.score.lineCounter < 2) {
    Anim.animTime = Anim.timeLimit;
  }
};

/** End combo */
Anim.endComboCounterAnim = function() {
  Anim.animating = 'regular';
};

///////////////////////////////////////////////////////////////////////////////
////////////// Animating new orbs as they enter the board /////////////////////
///////////////////////////////////////////////////////////////////////////////

/** New Orb Anim done by Lauren */
Anim.startNewOrbAnim = function() {
  Anim.wake('newOrb', 1);
};

/** Step new orb */
Anim.stepNewOrbAnim = function() {
  for (var i = 0; i < Main.game.numNewOrbs; i++) {
    var distance = Anim.animTime / Anim.timeLimit;
    var x = Main.game.newOrbPos[i].x * (1 - distance) +
        Main.game.newOrbHexes[i].center.x * distance;
    var y = Main.game.newOrbPos[i].y * (1 - distance) +
        Main.game.newOrbHexes[i].center.y * distance;
    Main.game.newOrbs[i].center = new Pixel(x, y);
  }
};

/** End new orb */
Anim.endNewOrbAnim = function() {
  for (var i = 0; i < Main.game.numNewOrbs; i++) {
    Main.game.newOrbs[i].center = Main.game.newOrbHexes[i].center;
  }
  Main.game.generateNewOrbs();
  Main.game.checkIfNewOrbsMadeMatches();
  if (Anim.resizedWindow)
    Anim.animating = 'regular';
  else
    Anim.startResizeWindow(Main.canvas.width, Main.canvas.height + 20);
};

///////////////////////////////////////////////////////////////////////////////
////////////// End game animation /////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/** End Game Anim done by Yeri */
Anim.startEndGameAnim = function() {
  Anim.wake('end', 1);
  showScorePopup();
  displayEndScore();
};

/** Step endgame */
Anim.stepEndGameAnim = function() {
  var time = new Date().getTime() * 0.01;
  var x = Math.sin(time) * 325 * Main.pixelRatio + Main.canvas.width / 2 - 10;
  var y = Math.cos(time * 0.9) * 350 * Main.pixelRatio + Main.canvas.height / 2;
  Main.ctx.drawImage(Orb.load('Wild.svg'),
                     x, y,
                     Hex.ORB_RADIUS * 2, Hex.ORB_RADIUS * 2);
};

/** End end end end end */
Anim.endEndGameAnim = function() {
  Anim.animating = 'regular';
  resetGame();
};

/**
 * @param {number} width Width.
 * @param {number} height Height.
 */
Anim.startResizeWindow = function(width, height) {
  Anim.resizedWindow = true;
  Anim.startWinWidth = window.innerWidth;
  Anim.startWinHeight = window.innerHeight;
  Anim.targetWinWidth = width;
  Anim.targetWinHeight = height;
  Anim.wake('resizeWindow', 1);
};

/** */
Anim.stepResizeWindow = function() {
  var distance = Anim.animTime / Anim.timeLimit;
  chrome.app.window.current().resizeTo(
      Anim.startWinWidth +
          distance * (Anim.targetWinWidth - Anim.startWinWidth),
      Anim.startWinHeight +
          distance * (Anim.targetWinHeight - Anim.startWinHeight));
};

/** */
Anim.endResizeWindow = function() {
  Anim.animating = 'regular';
  chrome.app.window.current().resizeTo(Anim.targetWinWidth,
                                       Anim.targetWinHeight);
};

/** Start function map */
Anim.start = {
  'path': Anim.startPathAnim,
  'remove': Anim.startRemoveAnim,
  'counter': Anim.startComboCounterAnim,
  'newOrb': Anim.startNewOrbAnim,
  'end': Anim.startEndGameAnim
};

/** Step function map */
Anim.step = {
  'path': Anim.stepPathAnim,
  'remove': Anim.stepRemoveAnim,
  'newOrb': Anim.stepNewOrbAnim,
  'end': Anim.stepEndGameAnim,
  'resizeWindow': Anim.stepResizeWindow
};

/** End function map */
Anim.end = {
  'path': Anim.endPathAnim,
  'remove': Anim.endRemoveAnim,
  'counter': Anim.endComboCounterAnim,
  'newOrb': Anim.endNewOrbAnim,
  'end': Anim.endEndGameAnim,
  'resizeWindow': Anim.endResizeWindow
};


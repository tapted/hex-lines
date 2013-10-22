/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/**
 * @constructor
 */
function Score() {
  this.currentScore = 0;
  this.removeCounter = 0;
  this.lineCounter = 0;
}

/** @const @type {number} */
Score.RIGHT_PADDING = 20;
/** @const @type {number} */
Score.TOP_PADDING = 10;
/** @const @type {number} */
Score.WIDTH = 180;
/** @const @type {number} */
Score.HEIGHT = 40;
/** @const @type {number} */
Score.INNER_MARGIN = 10;
/** @const @type {number} */
Score.COUNTER_WIDTH = 50;
/** @const @type {number} */
Score.COUNTER_HEIGHT = 30;
/** @const @type {number} */
Score.COUNTER_CORNER_RADIUS = 5;
/** @const @type {number} */
Score.TEXT_BASELINE = Score.HEIGHT - Score.INNER_MARGIN;

/**
 * @author Yeri
 */
Score.prototype.updateScore = function() {
  this.lineCounter = Anim.scoreToAdd.length;
  for (var i = 0; i < this.lineCounter; i++) {
    Main.game.score.currentScore += this.levelPoint() *
        Math.pow(2, Anim.scoreToAdd[i] - Main.game.minRemoveOrb) *
        Math.pow(2, this.removeCounter - 1);
  }

  for (var i = 2; i <= this.lineCounter; i++) {
    Main.game.score.currentScore += 50;
  }
};

/**
 * @author Yeri
 * @return {number} TODO.
 */
Score.prototype.levelPoint = function() {
  var defaultPoint;
  switch (Main.game.level.stage) {
    case 'Easy':
      defaultPoint = 5;
      break;
    case 'Hard':
      defaultPoint = 20;
      break;
    default:
      defaultPoint = 10;
      break;
  }
  return defaultPoint;
};

/**
 * @author Yeri
 */
Score.prototype.displayScore = function() {
  Main.ctx.lineWidth = 2;
  Main.ctx.textAlign = 'right';
  Main.ctx.textBaseline = 'middle';
  Main.ctx.strokeStyle = '#000000';
  Main.ctx.strokeRect(
      Main.canvas.width - Score.WIDTH - Score.RIGHT_PADDING,
      Score.TOP_PADDING,
      Score.WIDTH, Score.HEIGHT);
  Main.ctx.font = '36px Arial';
  Main.ctx.fillStyle = '#000000';
  Main.ctx.fillText(
      this.currentScore.toString(),
      Main.canvas.width - Score.INNER_MARGIN - Score.RIGHT_PADDING,
      Score.TEXT_BASELINE);
  this.displayRemoveCounter();
};

/**
 * @author Yeri
 */
Score.prototype.displayLineCounter = function() {
  if (this.lineCounter <= 1)
    return;

  var fontSize = 35 + this.removeCounter * 0.5;
  var grd = Main.ctx.createLinearGradient(0, 0, 0.1, 100);
  grd.addColorStop(0, '#000000');
  grd.addColorStop(0.3, 'magenta');
  grd.addColorStop(0.5, 'blue');
  grd.addColorStop(0.6, 'green');
  grd.addColorStop(0.8, 'yellow');
  grd.addColorStop(1, 'red');
  Main.ctx.globalCompositeOperation = 'source-over';
  Main.ctx.strokeStyle = grd;
  if (fontSize < 40) {
    Main.ctx.font = fontSize + 'px Arial';
  } else {
    Main.ctx.font = '40px Arial';
  }
  Main.ctx.fillText('Combo Bonus + ' + this.lineCounter.toString() + ' x50',
      Main.canvas.width * 0.33, Main.canvas.height / 2,
      Main.canvas.width * 0.5);
};

/**
 * @author Yeri
 * @param {number} x X.
 * @param {number} y Y.
 * @param {number} w Width.
 * @param {number} h Height.
 * @param {number} radius Radius.
 */
Score.prototype.drawCounterBox = function(x, y, w, h, radius) {
  var r = x + w;
  var b = y + h;
  Main.ctx.beginPath();
  Main.ctx.strokeStyle = 'black';
  Main.ctx.lineWidth = '2';
  Main.ctx.moveTo(x + radius, y); // Hook position.
  //Main.ctx.lineTo(x + radius / 2, y - 10); // Hook position.
  //Main.ctx.lineTo(x + radius * 2, y); // Hook position.
  Main.ctx.lineTo(r - radius, y); // Hook position.
  Main.ctx.quadraticCurveTo(r, y, r, y + radius);
  Main.ctx.lineTo(r, y + h - radius);
  Main.ctx.quadraticCurveTo(r, b, r - radius, b);
  Main.ctx.lineTo(x + radius, b);
  Main.ctx.quadraticCurveTo(x, b, x, b - radius);
  Main.ctx.lineTo(x, y + radius);
  Main.ctx.quadraticCurveTo(x, y, x + radius, y);
  Main.ctx.stroke();
  Main.ctx.fillStyle = 'Red';
  Main.ctx.fill();
};

/**
 * @author Yeri
 */
Score.prototype.displayRemoveCounter = function() {
  if (this.removeCounter == 0)
    return;

  var text = 'x' + (1 + this.removeCounter).toString();
  var fontSize = Math.min(Score.COUNTER_HEIGHT - 1,
                          Score.COUNTER_HEIGHT - 10 + this.removeCounter);
  this.drawCounterBox(
      Main.canvas.width - Score.WIDTH - Score.RIGHT_PADDING +
          Score.INNER_MARGIN,
      Score.INNER_MARGIN / 2 + Score.TOP_PADDING,
      Score.COUNTER_WIDTH, Score.COUNTER_HEIGHT,
      Score.COUNTER_CORNER_RADIUS);
  Main.ctx.fillStyle = 'black';
  Main.ctx.font = 'italic ' + fontSize + 'px Arial';
  Main.ctx.fillText(
      text,
      Main.canvas.width - Score.WIDTH + Score.RIGHT_PADDING +
          Score.INNER_MARGIN + 2,
      Score.TEXT_BASELINE);
};

/**
 * @author Lauren
 * @param {number} newScore TODO.
 */
var saveScores = function(newScore) {
  chrome.storage.sync.get(null, function(storage) {
    var insertSpot = 10;
    var storeScore = true;
    var scores = storage['HighScores'];
    for (var i = scores.length - 1; i >= 0; i--) {
      if (newScore > scores[i]) {
        insertSpot--;
      } else if (newScore === scores[i]) {
        storeScore = false;
      } else {
        break;
      }
    }

    if (storeScore) {
      scores.splice(insertSpot, 0, newScore);
      scores.length = 10;
      chrome.storage.sync.set({'HighScores': scores});
    }
  });
};

/**
 * @author Lauren
 */
var initializeHighScores = function() {
  var HighScores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  chrome.storage.sync.get(null, function(storage) {
    // If the highScore list is not initialized yet, initialize it.
    if (storage.HighScores === undefined) {
      chrome.storage.sync.set({'HighScores': HighScores});
    }
  });
};

/**
 * @author Lauren
 */
var resetLocalScore = function() {
  var HighScores = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  chrome.storage.sync.set({'HighScores': HighScores});
  displayLocalScoreBoard();
};

/**
 * @author Yeri
 */
var displayEndScore = function() {
  var popup = $('popup');
  var popupCtx = popup.getContext('2d');
  popupCtx.clearRect(0, 0, popup.width, popup.height);
  popupCtx.font = '30px Arial';
  popupCtx.fillStyle = 'black';
  popupCtx.fillText('Your score is ' + Main.game.score.currentScore,
      popup.width * 0.15, 90);
};

/**
 * @author Yeri
 */
var showScorePopup = function() {
  $('popup').className = 'show';
};

/**
 * @author Yeri
 */
var hideScorePopup = function() {
  $('popup').className = 'hide';
};

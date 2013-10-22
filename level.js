/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

/*Whole file done by Yeri*/
/**
 * @constructor
 */
function Level() {
  this.stage = '';
  this.normalOrbProbs = null;
  this.fixedOrbProbs = null;
  this.otherProbs = null;
  this.numColors = null;
}

/** Initialise default settings */
Level.defaultSetting = function() {
  Level.EASY_LEVEL = 'Easy';
  Level.EASY_NORMAL_ORB_PROBS = 6;
  Level.EASY_FIXED_ORB_PROBS = 1;
  Level.EASY_OTHER_PROBS = 3;
  Level.EASY_NUM_COLORS = 5;

  Level.NORMAL_STAGE = 'Normal';
  Level.NORMAL_NORMAL_ORB_PROBS = 6;
  Level.NORMAL_FIXED_ORB_PROBS = 2;
  Level.NORMAL_OTHER_PROBS = 2;
  Level.NORMAL_NUM_COLORS = 5;

  Level.HARD_STAGE = 'Hard';
  Level.HARD_NORMAL_ORB_PROBS = 6;
  Level.HARD_FIXED_ORB_PROBS = 3;
  Level.HARD_OTHER_PROBS = 1;
  Level.HARD_NUM_COLORS = 5;
};

/**
 * @return {number} TODO.
 */
Level.prototype.getDefaultNumColors = function() {
  switch (this.stage) {
    case 'Easy':
      return Level.EASY_NUM_COLORS;
      break;
    case 'Normal':
      return Level.NORMAL_NUM_COLORS;
      break;
    case 'Hard':
      return Level.HARD_NUM_COLORS;
      break;
  }
  return 0;
};

/**
 * @return {Level} TODO.
 */
var setDifficulty = function() {
  var level = new Level();
  switch (getDifficulty()) {
    // Easy.
    case 0:
      level.stage = Level.EASY_LEVEL;
      level.normalOrbProbs = Level.EASY_NORMAL_ORB_PROBS;
      level.fixedOrbProbs = Level.EASY_FIXED_ORB_PROBS;
      level.otherProbs = Level.EASY_OTHER_PROBS;
      level.numColors = Level.EASY_NUM_COLORS;
      level.turnsPerLevel = 20;
      level.scoreType = '(easy)';
      break;
    // Normal.
    case 1:
      level.stage = Level.NORMAL_STAGE;
      level.normalOrbProbs = Level.NORMAL_NORMAL_ORB_PROBS;
      level.fixedOrbProbs = Level.NORMAL_FIXED_ORB_PROBS;
      level.otherProbs = Level.NORMAL_OTHER_PROBS;
      level.numColors = Level.NORMAL_NUM_COLORS;
      level.turnsPerLevel = 15;
      level.scoreType = '(Medium)';
      break;
    // Hard.
    case 2:
      level.stage = Level.HARD_STAGE;
      level.normalOrbProbs = Level.HARD_NORMAL_ORB_PROBS;
      level.fixedOrbProbs = Level.HARD_FIXED_ORB_PROBS;
      level.otherProbs = Level.HARD_OTHER_PROBS;
      level.numColors = Level.HARD_NUM_COLORS;
      level.turnsPerLevel = 10;
      level.scoreType = '(HARD)';
      break;
  }
  return level;
};

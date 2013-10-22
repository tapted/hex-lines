// Copyright 2013 Google Inc. All rights reserved.
// Use of this source code is governed by the Apache license that can be
// found in the LICENSE file.

////////////////////////////////////////////////////////////////////////////////
///////////////// below codes are related with testing path ////////////////////
////////////////////////////////////////////////////////////////////////////////

// when a center column is blocked check path algorithm working correctly
var test1 = function () { 

  for (var i = -2 * board.boardSize + 2; i < 2 * board.boardSize; i += 2) {
    board.hexes[[0, i]].updateOrb ("red");
  }
  board.hexes[[-4, -4]].updateOrb("red");
  searchPath(board.hexes, board.hexes[[-4, -4]], board.hexes[[4, 4]]); // no path
  console.log("test1 - 1 expected result: no path");
  searchPath(board.hexes, board.hexes[[4, -4]], board.hexes[[-4, -4]]); // invalid start position
  console.log("test1 - 2 expected result: start tile has no orbs: invalid order");
  board.hexes[[-1, -7]].updateOrb("red");
  board.hexes[[-1, 7]].updateOrb("red");
  searchPath(board.hexes, board.hexes[[-1, -7]], board.hexes[[-1, 7]]); // invalid goal position
  console.log("test1 - 3 expected result: goal tile has already orbs: invalid order");
  searchPath(board.hexes, board.hexes[[-1, 7]], board.hexes[[-1, -7]]); // invalid goal position
  console.log("test1 - 4 expected result: goal tile has already orbs: invalid order");
  searchPath(board.hexes, board.hexes[[-4, -4]], board.hexes[[-2,6]]); // path
  console.log("test1 - 5 expected result: path exists");
  searchPath(board.hexes, board.hexes[[2, -6]], board.hexes[[0, 0]]); // no path
  console.log("test1 - 6 expected result: start tile has no orbs: invalid order");

}

// checck path algorithm working correctly when there's one way
var test2 = function () { 
  for (var i = -board.boardSize + 2; i < board.boardSize; i += 2) {
    if (i < 0) {
      for (var j = -board.numColumns + 1 - i; j <= board.numColumns - 1 + i; j += 2) {
        board.hexes[[i, j]].updateOrb ("red");
      }
    } else {
      for (var j = -board.numColumns + 1 + i; j <= board.numColumns - 1 - i; j += 2) {
        board.hexes[[i, j]].updateOrb ("red");
      }
    }
  } 
  board.hexes[[-3, 5]].updateOrb("empty");
  board.hexes[[-1, -7]].updateOrb("empty");
  board.hexes[[1, 7]].updateOrb("empty");
  board.hexes[[3, -5]].updateOrb("empty");
  board.hexes[[0, -8]].updateOrb("red");
  board.hexes[[-4, -4]].updateOrb("red");
  searchPath(board.hexes, board.hexes[[-4, -4]], board.hexes[[4, 4]]); // path
  board.hexes[[-4, -4]].updateOrb("empty");
  console.log("test2 - 1 expected result: path exists");
  searchPath(board.hexes, board.hexes[[-3, -5]], board.hexes[[4, 4]]); // path
  console.log("test2 - 2 expected result: path exists");
  searchPath(board.hexes, board.hexes[[-1, 1]], board.hexes[[2, -6]]); // path
  console.log("test2 - 3 expected result: path exists");
  searchPath(board.hexes, board.hexes[[-4, 2]], board.hexes[[-2, 0]]); // invalid start position
  console.log("test2 - 4 expected result: start tile has no orbs, no path");
  searchPath(board.hexes, board.hexes[[-3, -3]], board.hexes[[3, 3]]); // invalid goal position
  console.log("test2 - 5 expected result: goal tile already has orbs: no path");
}


///////////////////////////////////////////////////////////////////////////////
////////////// below codes are related with testing removeOrb() ///////////////
///////////////////////////////////////////////////////////////////////////////

var test3 = function() {
  console.log("test3 start!");
  for (var i = -4; i < 4; i +=2) { // case 1: 4 orbs on vertical line  
    board.hexes[[-2, i]].updateOrb("red");
  }
  board.hexes[[-2,4]].updateOrb("red");
  removeOrb(board.hexes[[-2, 4]]);
  console.log("test3 finished!");
}

var test4 = function() { 
  for (var i = -3; i < 1; i++) { // case 2: 4 orbs on right to left line
    board.hexes[[i, -4 -i]].updateOrb("red");
  }
  board.hexes[[1, -5]].updateOrb("red");
  removeOrb(board.hexes[[1, -5]]);
}

var test5 = function() {  
  for (var i = -1; i < 3; i++) { // case 3: 4 orbs on left to right line
    board.hexes[[i, -4 + i]].updateOrb("red");
  }
  board.hexes[[3, -1]].updateOrb("red");
  removeOrb(board.hexes[[3, -1]]);
}

var test6 = function() {
  for (var i = -4; i < 5; i +=2) { // case 4: 4 orbs on vertical line  
    if (i !== 0) { // center is empty
      board.hexes[[-2, i]].updateOrb("red");
    }
  }
  board.hexes[[-2, 0]].updateOrb("red");
  removeOrb(board.hexes[[-2, 0]]);
}

var test7 = function() {
  for (var i = -3; i < 2; i++) { // case 5: 4 orbs on right to left line
    if (i !== -1) { // center is empty
      board.hexes[[i, -4 -i]].updateOrb("red");
    }
  }
  board.hexes[[-1, -3]].updateOrb("red"); 
  removeOrb(board.hexes[[-1, -3]]);
}

var test8 = function() {  
  for (var i = -1; i < 4; i++) { // case 6: 4 orbs on left to right line
    if (i !== 1) { // center is empty   
      board.hexes[[i, -4 + i]].updateOrb("red");
    }
  }
  board.hexes[[1, -3]].updateOrb("red");
  removeOrb(board.hexes[[1, -3]]);
}

var test9 = function() {
  for (var i = 0; i < 4; i++) { // case 7: 4 orbs on left to right & right to left lines
    board.hexes[[i, -6 + i]].updateOrb("red");
    board.hexes[[i, 2 - i]].updateOrb("red"); 
  }
  board.hexes[[4, -2]].updateOrb("red");
  removeOrb(board.hexes[[4, -2]]);
}

var test10 = function() { 
  for (var i = -1; i < 4; i++) { // case 8: 4 orbs on left to right & right to left lines
    if (i !== 1) { // center is empty
      board.hexes[[i, -4 + i]].updateOrb("red");
      board.hexes[[i, -2 - i]].updateOrb("red");  
    }
  }
  board.hexes[[1, -3]].updateOrb("red");
  removeOrb(board.hexes[[1, -3]]);
}

var test11 = function() {
  for (var i = -2; i < 2; i++) { // case 9: 4 orbs on left to right & vertical lines
      board.hexes[[-2, -2 + 2 * i]].updateOrb("red");
      board.hexes[[i + 1, 5 + i]].updateOrb("red"); 
  }
  board.hexes[[-2, 2]].updateOrb("red");
  removeOrb(board.hexes[[-2, 2]]);
}

var test12 = function() {
  for (var i = -2; i < 3; i++) { // case 10: 4 orbs on left to right & vertical lines
    if (i !== 0) { // center is empty
      board.hexes[[0, 2 * i]].updateOrb("red");
      board.hexes[[i, i]].updateOrb("red"); 
    }
  } 
  board.hexes[[0, 0]].updateOrb("red");
  removeOrb(board.hexes[[0, 0]]);
}

var test13 = function() { 
  for (var i = -2; i < 2; i++) { // case 11: 4 orbs on right to left & vertical lines
      board.hexes[[-2, -2 + 2 * i]].updateOrb("red");
      board.hexes[[i + 1, -i - 1]].updateOrb("red");  
  }
  board.hexes[[-2, 2]].updateOrb("red");
  removeOrb(board.hexes[[-2, 2]]);
}

var test14 = function() {
  for (var i = -2; i < 3; i++) { // case 12: 4 orbs on right to left & vertical lines
    if (i !== 0) { // center is empty
      board.hexes[[0, 2 * i]].updateOrb("red");
      board.hexes[[i, -i]].updateOrb("red");        
    }
  }
  board.hexes[[0, 0]].updateOrb("red");
  removeOrb(board.hexes[[0, 0]]);
}

var test15 = function() {
  for (var i = -2; i < 2; i++) { // case 13: 4 orbs on right to left, left to right & vertical lines
      board.hexes[[-2, -2 + 2 * i]].updateOrb("red");
      board.hexes[[i + 1, -i - 1]].updateOrb("red");  
      board.hexes[[i + 1, 5 + i]].updateOrb("red");
  }
  board.hexes[[-2, 2]].updateOrb("red");
  removeOrb(board.hexes[[-2, 2]]);
}

var test16 = function() { 
  for (var i = -2; i < 3; i++) { // case 14: 4 orbs on right to left, left to right & vertical lines
    if (i !== 0) {
      board.hexes[[0, -2 + 2 * i]].updateOrb("red");
      board.hexes[[i, 2 + i]].updateOrb("red"); 
      board.hexes[[i, 2 - i]].updateOrb("red");
    }       
  }
  board.hexes[[0, -2]].updateOrb("red");
  removeOrb(board.hexes[[0, 2]]);
}

var test17 = function() {
  for (var i = -6; i <= 6; i +=2) { // case 15: 4, 2 orbs on vertical line  
    if (i !== 2) {
      board.hexes[[-2, i]].updateOrb("red");
    }
  } 
  board.hexes[[-2, 2]].updateOrb("red");
  removeOrb(board.hexes[[-2, 2]]);
}

var test18 = function() {
  for (var i = -4; i < 3; i++) { // case 16: 2, 4 orbs on right to left line
    if (i !== -2) { 
      board.hexes[[i, -4 -i]].updateOrb("red");
    }
  }
  board.hexes[[-2, -2]].updateOrb("red");
  removeOrb(board.hexes[[-2, -2]]);
}

var test19 = function() { 
  for (var i = -2; i < 5; i++) { // case 17: 3, 3 orbs on left to right line
    if (i !== 1) {
      board.hexes[[i, -4 + i]].updateOrb("red");
    }
  } 
  board.hexes[[1, -3]].updateOrb("red");
  removeOrb(board.hexes[[1, -3]]);
}

var test20 = function() { // case 18: 3 orbs on left to right line 

  for (var i = -2; i < 2; i++) {
    board.hexes[[i, -4 + i]].updateOrb("red");
  }
  removeOrb(board.hexes[[1, -3]]);
}

var test21 = function() {
  for (var i = -7; i < board.numColumns - 1; i += 2) {
    board.hexes[[-1, i]].updateOrb("red");
  }
  removeOrb(board.hexes[[-1, 1]]);
}

test1();
//test2();
//test3();
//test4();
//test5();
//test6();
//test7();
//test8();
//test9();
//test10();
//test11();
//test12();
//test13();
//test14();
//test15();
//test16();
//test17();
//test18();
//test19();
//test20();
//test21();

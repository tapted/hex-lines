/**
 * @license Copyright 2013 Google Inc. All rights reserved.
 * Use of this source code is governed by the Apache license that can be
 * found in the LICENSE file.
 */

///////////////////////////////////////////////////////////////////////////////
/////////// Setup and draw orbs ///////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

/**
 * @type {Object.<string, Image>}
 */
var OrbImageCache = {};

/**
 * @constructor
 * @param {string} color TODO.
 * @param {string} type TODO.
 */
function Orb(color, type) {
  /** @type {string} colour key */
  this.color = color;
  /** @type {string} special type */
  this.type = type;
  /** @type {Pixel} location */
  this.center = null;
  /** @type {number} current drawing radius. */
  this.radius = Hex.ORB_RADIUS;
  /** @type {string} how to remove from the grid */
  this.removeBy = 'default';

  /** @type {Image} orb color asset */
  this.img = Orb.load(this.color + '.svg');
  /** @type {Image} orb overlay asset */
  this.overlay = null;

  if (this.type === 'Normal' || this.type === 'Wild')
    return;

  this.overlay =
      Orb.load(this.type + (this.type == 'Exploder' ? '.png' : '.svg'));
}

/**
 * @param {string} key Filename to load.
 * @return {Image} DOM Image.
 */
Orb.load = function(key) {
  var img = OrbImageCache[key];
  if (img)
    return img;

  img = new Image;
  img.src = 'Assets/' + key;
  OrbImageCache[key] = img;
  return img;
};

/**
 * @author Both - created by Lauren, updated by Yeri
 * @param {Pixel} center TODO.
 * @param {boolean} clicked TODO.
 * @param {boolean} mouseOver TODO.
 */
Orb.prototype.draw = function(center, clicked, mouseOver) {
  if (this.removeBy === 'Destroyer') {
    Main.ctx.beginPath();
    Main.ctx.arc(center.x, center.y, Hex.ORB_RADIUS, 0, 2 * Math.PI);
    Main.ctx.stroke();
    Main.ctx.fillStyle = 'black';
    Main.ctx.fill();
    Main.ctx.closePath();
  }

  Main.ctx.drawImage(this.img,
                     center.x - this.radius, center.y - this.radius,
                     2 * this.radius, 2 * this.radius);

  if (this.overlay) {
    Main.ctx.drawImage(this.overlay,
                       center.x - this.radius, center.y - this.radius,
                       2 * this.radius, 2 * this.radius);
  }

  if (this.removeBy === 'Exploder') {
    Main.ctx.drawImage(Orb.load('crack.png'),
                       center.x - this.radius, center.y - this.radius,
                       2 * this.radius, 2 * this.radius);
  }

  Main.ctx.strokeStyle = 'black';
  Main.ctx.beginPath();
  Main.ctx.arc(center.x, center.y, this.radius, 0, 2 * Math.PI);
  Main.ctx.lineWidth = 2;
  if ((clicked || mouseOver) && this.type !== 'Fixed') {
    Main.ctx.lineWidth = clicked ? 5 : 4;
  }
  Main.ctx.stroke();
};

/**
 * @author Lauren
 * @param {Pixel} center TODO.
 */
Orb.prototype.setCenter = function(center) {
  this.center = center;
};

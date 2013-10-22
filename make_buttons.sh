#!/bin/bash
function button {
  sed -e"s/@SOLID@/$2/g;s/@MID@/$3/g;s/@LIGHT@/$4/g" < resources/button.svg > tmp.svg
  if ! diff -q tmp.svg app/Assets/"$1.svg" ; then
    cp tmp.svg app/Assets/"$1.svg"
  fi
  rm tmp.svg
}

button Red f00 b00 500
button Green 0f0 0a0 040
button Blue aaf 44c 00a
button Cyan 0ff 0aa 044
button Yellow ff0 cc0 770
button Purple c0f 70a 304
button Brown c55 922 311
button Grey ccc 999 444
button Orange ffa500 b70 430
button Pink ffc0cb b77 533
button LimeGreen cf1 ad1 7a0
#button Wild f00 00f ff0

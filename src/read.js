'use strict';

const DEBUG = false;

import { literal, nil } from './types.js';
import * as fs from 'fs';
import * as path from 'path';

export function parse (filename) {
  let code = read(filename);
  let tokens = tokenize(code);
  return expressionize(tokens);
}

function read(filename) {
  return fs.readFileSync(filename, 'UTF-8');
}

/**
 * splits a code string into separate strings
 *
 * @param codeString string
 * @returns array of strings
 */
function tokenize(codeString) {
  let splitStream = codeString.split(/([()\[\]'"{}#]|[^\s()\[\]'"{}#]+)/g);

  let inString = false;
  for (let i in splitStream)
    if (splitStream[i].match(/\s+/) || splitStream[i] === '')
      splitStream.splice(i, 1);

  return splitStream;
}

/**
 * Turns the gramar into a tree
 *
 * @param
 * @returns
 */
function expressionize(code, i) {
  let returnIndex = !!i;

  let expr = [];
  for (i = i || 0; i < code.length; i++) {
    let token = code[i];

    if (token === '(') {
      if (DEBUG) console.log('found open paren');
      var newExpr;
      [newExpr, i] = expressionize(code, i + 1);
      expr.push(newExpr);

    } else if (token === ')') {

      if (returnIndex)
        return [expr, i];
      else
        return expr;

    } else if (token === '{') {

      if (DEBUG) console.log('found start of object');
      var obj = {};
      while(code[++i] !== '}') {
        obj[token] = code[++i];
      }
      expr.push(literal, obj);

    } else if (token === '[') {

      var arr = [];
      while(code[++i] !== ']') {
        arr.push(code[i]);
      }
      expr.push(literal, arr);

    } else if (token === '"' || token  === '\'') {

      if (DEBUG) console.log('found \' or "');
      var str = '';
      while(!code[++i].match(/^['"]/)) {
        if (DEBUG) console.log(code[i]);
        str = str + ' ' + code[i];
      }
      str = str.slice(1, str.length);
      expr.push(literal, str);

    } else if (token.match(/^-?\d*\.?\d*$/)) {

      expr.push(parseInt(token));

    }
    else {

      if (DEBUG) console.log('found : ' + token);
      expr.push(token);

    }
  }
  return expr;
}

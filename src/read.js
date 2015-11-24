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

function expressionize(code, i) {
  let returnIndex = !!i;

  let expr = [];
  for (i = i || 0; i < code.length; i++) switch (code[i]) {
    case '(':
      if (DEBUG) console.log('found open paren');
      var newExpr;
      [newExpr, i] = expressionize(code, i + 1);

      expr.push(newExpr);
      break;
    case ')':
      if (returnIndex)
        return [expr, i];
      else
        return expr;
      break;

    case '{':
      if (DEBUG) console.log('found start of object');
      var obj = {};
      while(code[++i] !== '}') {
        obj[code[i]] = code[++i];
      }

      expr.push(literal, obj);
      break;

    case '[':
      var arr = [];
      while(code[++i] !== ']') {
        arr.push(code[i]);
      }

      expr.push(literal, arr);
      break;

    case '\'': case '"':
      if (DEBUG) console.log('found \' or "');
      var str = '';
      while(!code[++i].match(/^['"]/)) {
        if (DEBUG) console.log(code[i]);
        str = str + ' ' + code[i];
      }
      str = str.slice(1, str.length);

      expr.push(literal, str);
      break;

    default:
      if (DEBUG) console.log('found token: ' + code[i]);
      expr.push(code[i]);
  }
  return expr;
}

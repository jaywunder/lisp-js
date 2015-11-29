'use strict';

const DEBUG = false;

import { Expression, Literal, Atom, nil } from './types.js';
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

function tokenize(codeString) {
  let splitStream = codeString.split(/([()\[\]'"{}#]|[^\s()\[\]'"{}#]+)/g);

  for (let i in splitStream)
    if (splitStream[i].match(/\s+/) || splitStream[i] === '')
      splitStream.splice(i, 1);

  return splitStream;
}

function expressionize(code, i) {
  let returnIndex = !!i;

  let expr = new Expression();
  for (i = i || 0; i < code.length; i++) {
    let token = code[i];

    if (token === '(') { // start of a new expression
      if (DEBUG) console.log('found open paren');
      var newExpr;
      [newExpr, i] = expressionize(code, i + 1);
      expr.push(Expression.from(newExpr));

    } else if (token === ')') { // end of an expression

      if (returnIndex)
        return [expr, i];
      else
        return expr;

    } else if (token === '{') { // object

      if (DEBUG) console.log('found start of object');

      let obj = {};
      while(code[++i] !== '}') {
        obj[code[i]] = code[++i];
      }
      expr.push(new Literal(obj));

    } else if (token === '[') { // arrays

      let arr = [];
      while(code[++i] !== ']') {
        arr.push(code[i]);
      }
      expr.push(new Literal(arr));

    } else if (token.match(/^['"]/)) { // string

      if (DEBUG) console.log('found \' or "');
      let str = '';
      while(!code[++i].match(/^['"]/)) {
        if (DEBUG) console.log('> ' + code[i]);
        str = str + ' ' + code[i];
      }
      str = str.slice(1, str.length);
      expr.push(new Literal(str));

    } else if (!!parseFloat(token) || token === '0') { // number
      if (DEBUG) console.log('found number');

      expr.push(new Literal(parseFloat(token)));

    }
    else {

      if (DEBUG) console.log('found: ' + token);
      expr.push(new Atom(token, undefined));

    }
  }
  return expr;
}

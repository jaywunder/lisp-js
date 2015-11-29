import {
  Expression, Literal, Atom,
  isExpression, isLiteral, isAtom
} from './tree.js';

const DEBUG = true;

export class Env {
  constructor(code) {
    this.code = code;

    this.bindings = {};
    this.intrinsics = {};

    this.makeIntrinsics();
  }

  addIntrinsic(atom, value) {
    if (DEBUG) console.log('adding intrinsic: ' + atom);
    this.intrinsics[atom] = value;
  }

  addBinding(atom, value) {
    if (DEBUG) console.log('adding binding: ' + atom);
    this.bindings[atom] = value;
  }

  makeIntrinsics() {
    this.intrinsics = {
      'null': new Literal(null),
      'let': _let,
      'defun': defun,
      'print': print,
      '+': plus,
      '-': minus,
      '*': times,
      '÷': divide,
      '/': divide,
      '++': plusPlus,
      'if': _if,
      'elif': _if,
      'else': _else,
      '>': gt,
      '<': lt,
      '>=': ge,
      '<=': le,
      '==': eq,
      '!=': ne,
      '&&': and,
      'and': and,
      '||': or,
      'or': or,
      '^': xor,
      'xor': xor,
      '!': not,
      'not': not
    };
  }

  get(atom) {
    // console.log('getting %s', atom);
    if (!this.intrinsics[atom] && !this.bindings[atom])
      throw new Error(`${atom} isn't defined`);

    else
      return this.intrinsics[atom] || this.bindings[atom];
  }

  run(expr) {
    let func = this.get(expr[0].name);
    let args = expr.splice(1, expr.length);
    return func.apply(this, args);
  }

  eval(token) {
    if (isExpression(token)) {
      let startIndex = isAtom(token[0]) ? 1 : 0;
      let nonEvalFuncs = ['if', 'elif', 'else', 'defun'];

      if (nonEvalFuncs.indexOf(token[0].name) < 0)
        for (var i = startIndex; i < token.length; i++)
          token[i] = this.eval(token[i]);

      if (isAtom(token[0])){
        return this.run(token);
      }
    }

    if (isAtom(token))
      return this.get(token);

    if (isLiteral(token))
      return token.value;
  }
}

export class Fn extends Atom {
  constructor (scope, name, code) {
    super(name, code);
    this.scope = scope;
  }
}

function _let(...args) {
  for (var i = 0; i < args.length; i++) {
    let atom = args[i].name;
    let value = args[++i].value;
    if (DEBUG) console.log(atom.name + ' = ' + value.value);
    this.addBinding(atom, value);
  }
}

function defun(...args) {
  console.log('defining: ' + args);
}

function print(...args) {
  let str = '';
  for (var i = 0; i < args.length; i++) {
    str = str + args[i] + ' ';
  }
  console.log(str);
  return str;
}

function plus(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++){
    num = num + args[i];
  }
  return num;
}

function minus(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++) {
    num = num - args[i];
  }
  return num;
}

function times(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++)
    num = num * args[i];

  return num;
}

function divide(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++)
    num = num / args[i];

  return num;
}

function plusPlus(...args) {

  console.log('PLUSPLUSING %s', args);

  for (let i in args) {
    args[i] = args[i] + 1;
  }

  return args;
}

function _if(...args) {
  if (this.eval(args[0])) {
    this.eval(args[1]);
  } else if (args[2] == 'if' || args[2] == 'elif' || args[2] == 'else') {
    this.run(args.splice(2, args.length));
  }

}

function _else(...args) {
  this.eval(args[0]);
}

function gt(...args) {
  for (let i = 1; i < args.length; i++) {
    if (args[i-1] <= args[i]) return false;
  }
  return true;
}

function lt(...args) {
  for (let i = 1; i < args.length; i++) {
    if (args[i-1] >= args[i]) return false;
  }
  return true;
}

function ge(...args) {
  for (let i = 1; i < args.length; i++) {
    if (args[i-1] < args[i]) return false;
  }
  return true;
}

function le(...args) {
  for (let i = 1; i < args.length; i++) {
    if (args[i-1] > args[i]) return false;
  }
  return true;
}

function eq(...args) {
  let first = args[0];
  for (let i = 1; i < args.length; i++) {
    if (first !== args[i]) return false;
  }
  return true;
}

function ne(...args) {
  let first = args[0];
  for (let i = 1; i < args.length; i++) {
    if (first === args[i]) return false;
  }
  return true;
}

function and(...args) {
  for (let i = 0; i < args.length; i++) {
    if (!args[i]) return false;
  }
  return true;
}

function or(...args) {
  for (let i = 0; i < args.length; i++) {
    if (args[i]) return true;
  }
  return false;
}

function xor(...args) {
  return (args[0] ^ args[1]);
}

function not(...args) {
  if (args.length > 1)
    throw new Error('"not" only takes one argument, instead got many');
  return !this.eval(args);
}

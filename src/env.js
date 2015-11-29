import {
  Expression, Literal, Atom,
  isExpression, isLiteral, isAtom, isFunc
} from './types.js';

const DEBUG = false;

///////////////////////
// ENVIRONMENT CLASS //
///////////////////////
export class Env {
  constructor(options) {
    options = options || {};

    this.bindings = {};
    this.intrinsics = {};

    // we don't want to remake the intrinsics for every function
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

      // these are the functions that have to eval their own contents.
      // Example: An "if" statement wouldn't want everything to run until the
      // condition is known to be true.
      let nonEvalFuncs = ['if', 'elif', 'else', 'defun', 'let'];

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

    if (isFunc(token)){
      console.log('found a function!!');
      return token.run();
    }
  }
}

////////////////////
// FUNCTION CLASS //
////////////////////
export class Func extends Env {
  constructor (parent, expr) {
    super();
    this.parent = parent; // the parent scope
    this.arguments = expr.splice(0, 1); // first token should be the arguments
    this.expr = expr; // the rest of it should just be evaluated when called
  }

  makeIntrinsics() {
    this.intrinsics = {
      'return': _return,
    };
  }

  get(atom) {
    let value = this.bindings[atom] || this.intrinsics[atom] || this.parent.get(atom);
    if (!value)
      throw new Error(`${atom} isn't defined`);
    else
      return value;
  }

  apply(scope, args) {
    let argumentValues = [];
    for (var i = 0; i < args.length; i++) {
      argumentValues.push(this.arguments[0][i]);
      argumentValues.push(new Literal(args[i]));
    }

    _let.apply(this, argumentValues);
    this.eval(this.expr);
  }
}

function _let(...args) {
  for (var i = 0; i < args.length; i++) {
    if (!isAtom(args[i])) throw new Error('can\'t bind to literal ' + args[i]);

    let atom = args[i].name;
    let value = this.eval(args[++i]);
    if (DEBUG) console.log(atom + ' = ' + value);
    this.addBinding(atom, value);
  }
}

function defun(...args) {
  let atom = args.splice(0, 1);
  let value = new Func(this, args);
  this.addBinding(atom, value);
}

function print(...args) {
  let str = '';
  for (var i = 0; i < args.length; i++) {
    str = str + args[i] + ' ';
  }
  console.log(str);
  return str;
}

function _return(...args) {
  // this.
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

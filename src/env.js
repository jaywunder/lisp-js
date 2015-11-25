import { literal, nil } from './types.js';

const DEBUG = false;

export class Env {
  constructor(code) {
    this.code = code;

    this.bindings = {};
    this.intrinsics = {};

    this.makeIntrinsics();
  }

  addIntrinsic(atom, fn) {
    if (DEBUG) console.log('adding intrinsic: ' + atom);
    this.intrinsics[atom] = fn;
  }

  addBinding(atom, fn) {
    if (DEBUG) console.log('adding binding: ' + atom);
    this.bindings[atom] = fn;
  }

  get(atom) {
    if (!this.intrinsics[atom] && !this.bindings[atom]){
      return function(...args) {
        // throw new Error(`${atom} isn't defined`);
      };
    } else {
      return this.intrinsics[atom] || this.bindings[atom];
    }
  }

  run(context, code) {
    return this.get(code[0]).apply(context, code.splice(1, code.length));
  }

  eval(code) {
    for (let i = 0; i < code.length; i++) {
      if (Array.isArray(code[i]) && code[i-1] !== literal && !this.intrinsics[code[0]]) {
        code[i] = this.eval(code[i]);
      }
    }
    if (typeof code[0] === 'string')
      return this.run(this, code);
  }

  makeIntrinsics() {
    this.intrinsics = {
      'print': print,
      '+': plus,
      '-': minus,
      '*': times,
      '÷': divide,
      '/': divide,
      'plus-one': plusOne,
      'if': __if__,
      'elif': __elif__,
      'else': __else__,
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
}

function print(...args) {
  let str = '';
  for (var i = 0; i < args.length; i++) {
    if (args[i] !== literal)
      str = str + args[i] + ' ';
  }
  console.log(str);
  return args;
}

function plus(...args) {
  console.log('plusing!');
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

function plusOne(...args) {

  for (let i in args) {
    args[i] = args[i] + 1;
  }

  return args;
}

function __if__(...args) {
  console.log('testing: ' + args[0]);
  if (this.eval(args[0])) {
    console.log('running: ' + args[1]);
    this.eval(args[1]);
  }
}

function __else__(...args) {

}

function __elif__(...args) {

}

function gt(...args) {

}

function lt(...args) {

}

function ge(...args) {

}

function le(...args) {

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

}

function or(...args) {

}

function xor(...args) {

}

function not(...args) {

}

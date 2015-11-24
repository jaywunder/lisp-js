import { literal, nil } from './types.js';

const DEBUG = false;

export class Env {
  constructor(code) {
    this.code = code;

    this.bindings = {};
    this.intrinsics = {};

    this.makeIntrinsics();
  }

  makeIntrinsics() {
    this.addIntrinsic('print', print);
    this.addIntrinsic('+', plus);
    this.addIntrinsic('-', minus);
    this.addIntrinsic('*', times);
    this.addIntrinsic('÷', divide);
    this.addIntrinsic('/', divide);
    this.addIntrinsic('plus-one', plusOne);
  }

  addIntrinsic(atom, fn) {
    if (DEBUG) console.log('adding intrinsic: ' + atom);
    this.intrinsics[atom] = fn;
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

  eval(code) {
    for (let i = 0; i < code.length; i++) {
      if (Array.isArray(code[i]) && code[i-1] !== literal) {
        code[i] = this.eval(code[i]);
      }
    }
    if (typeof code[0] === 'string')
      return this.get(code[0]).apply(this, code.splice(1, code.length));
  }
}

function LITERAL(arg) {
  return arg;
}

function print(...args) {
  let str = '';
  for (var i = 0; i < args.length; i++) {
    if (args[i] !== literal)
      str = str + args[i].toString();
  }
  console.log(str);
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
  for (var i = 1; i < args.length; i++)
    num -= args[i];

  return num;
}

function times(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++)
    num *= args[i];

  return num;
}

function divide(...args) {
  var num = args[0];
  for (var i = 1; i < args.length; i++)
    num /= args[i];

  return num;
}

function plusOne(...args) {

}

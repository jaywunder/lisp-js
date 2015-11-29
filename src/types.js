const debug = false;

export class Expression extends Array {
  constructor(...args) { super(...args); }
}

export class Literal {
  constructor(value) {
    this.value = value;
  }

  toString() {
    return this.value;
  }
}

export class Atom {
  constructor(name) {
    this.name = '' + name;
  }

  toString() {
    return this.name;
  }
}

export function isExpression(thing) {
  if (debug) console.log('is [ %s ] an expression?', thing);
  if (thing === undefined) return false;
  return thing.constructor.name === 'Array';
}

export function isAtom(thing) {
  if (debug) console.log('is [ %s ] an atom?', thing);
  if (thing === undefined) return false;
  return thing.constructor.name === 'Atom';
}

export function isLiteral(thing) {
  if (debug) console.log('is [ %s ] a literal?', thing);
  if (thing === undefined) return true;
  try {return thing.constructor.name === 'Literal';}catch(err) {}
}

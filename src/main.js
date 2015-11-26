import { parse } from './read.js';
import { Env } from './env.js';

const DEBUG = false;
var env = new Env();

function main() {
  let code = parse(process.argv[2]);
  if (DEBUG) console.log(code);
  if (DEBUG) console.log(env);
  env.eval(code);
}

main();

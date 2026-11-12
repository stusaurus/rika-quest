import {execFileSync} from "node:child_process";
import {mkdirSync} from "node:fs";
import {resolve} from "node:path";

// A real immutable game build, not a mock of the previous visual state.
const ref="bec6d99f67f40818266c855e7ee28435ade0be78";
const directory=resolve("artifacts/akari-art-baseline");
mkdirSync(directory,{recursive:true});
const archive=execFileSync("git",["-c","safe.directory="+process.cwd(),"archive","--format=tar",ref,"games/akari"],{maxBuffer:32*1024*1024});
execFileSync("tar",["-x","-C",directory],{input:archive,maxBuffer:1024*1024});
console.log("Prepared real mission 1 baseline:",ref);

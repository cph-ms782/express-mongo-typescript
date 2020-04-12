// npm install uuid

require('dotenv').config();
import { expect } from "chai";
import fse from "fs-extra";
import { v4 as uuidv4 } from 'uuid';
const fs = require('fs')
const path = require('path');
const debug = require("debug")("game-case");


//VERY UNCOMMON TO INCLUDE WHAT IS TO BE TESTED IN THE TESTs, BUT THIS IS JUST MEANT AS A QUICK DEMO
function delayMsg(msg: string, delay: number) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!(msg && delay) || msg === "") {
        reject("Wrong arguments")
      } else
        resolve(msg.toUpperCase());
    }, delay);
  });
};

async function findFiles(folder: string, extension: string) {
  let files = await fs.readdir(folder, ((err: any, data: any) => {
    if (err) throw err;
    debug("Unfilterede results: ", data);
    const result: Array<string> = data.filter((file: string) => {
      return extension == path.extname(file);
    });
    debug("Filterede results: ", result);
    return result;
  }));
};

describe("DelayMsg behaviour, tested with async/await", function () {
  const folder = uuidv4();
  const jsFiles: Array<string> = [];
  const txtFiles: Array<string> = [];
  debug(folder);
  before(() => {
    fse.mkdirSync(folder);
    for (let index = 0; index < 5; index++) {
      jsFiles[index] = "./" + folder + "/" + uuidv4() + ".js";   // det er ikke nødvendigt at bruge uuid på fil navne da de alle alligevel bliver slettet af .removeSync() længere nede
      txtFiles[index] = "./" + folder + "/" + uuidv4() + ".txt"; // men så slipper man da for at finde på filnavne :-)
      fse.writeFileSync(jsFiles[index], "");
      fse.writeFileSync(txtFiles[index], "");
    }
  })
  it("Should eventually provide HELLO", async function () {
    const msg = await delayMsg("hello", 100);
    expect(msg).to.be.equal("HELLO");
  })
  it("Should eventually reject", async function () {
    try {
      const msg = await delayMsg("", 100);
    } catch (err) { //Observe --> normal try-catch, when you use async-await
      expect(err).to.be.equal("Wrong arguments");
    }
  })
  it("Should eventually find number of files in temp folder " + folder, async function () {
    try {
      const files: any = findFiles("./" + folder, ".txt");
      expect(files.length).to.be.equal(5);
    } catch (err) { //Observe --> normal try-catch, when you use async-await
      // expect(err).to.be.equal("Wrong arguments");
    }
  })
  after(() => {
    fse.removeSync(folder);
  })
})

// describe('Array', function () {
//   describe('Verify the #indexOf()', function () {
//     it('should return -1 when the value is not present', function () {
//       expect([1, 2, 3].indexOf(0)).to.be.equal(-1);
//       expect([1, 2, 3].indexOf(5)).to.be.equal(-1);
//       expect([1, 2, 3].indexOf(3)).to.be.equal(2);
//     })
//   })
// });

// describe("DelayMsg behaviour, tested WITHOUT async/await", function () {
//   it("Should eventually provide HELLO", function (done) {
//     delayMsg("hello", 100)
//       .then(function (msg) { expect(msg).to.be.equal("HELLO"); })
//       //.finally(done) //Use this with node Ver10 and above otherwise do
//       .then(done, done)
//   })
//   it("Should eventually provide HELLO", function (done) {
//     delayMsg("", 100)
//       .catch(function (err) {
//         expect(err).to.be.equal("Wrong arguments");
//       })//.finally(done) //Use this with node Ver10 and above otherwise do
//       .then(done, done)
//   })
// })     


// describe("Testing async behaviour", function () {
//   var foo = false;
//   before(function (done) {
//     setTimeout(function () {
//       foo = true;
//       done();  //Test will fail without this --> TRY
//     }, 1000);
//   });
//   it("should pass (with done called)", function () {
//     expect(foo).to.equal(true);
//   });
// });
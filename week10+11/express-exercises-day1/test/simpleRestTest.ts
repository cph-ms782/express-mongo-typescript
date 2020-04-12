import { expect } from "chai";
import { Server } from "http";
import fetch from "node-fetch";
import { type } from "os";

let server: Server;
const TEST_PORT = "7777"

describe("Create/Update Comments", () => {

  let URL: string;

  before((done) => {
    // When we include a database, make sure that we use the test database

    //Switch to the test port for the API-server
    process.env["PORT"] = TEST_PORT;
    server = require("../src/app").server;
    URL = `http://localhost:${process.env.PORT}`;
    done()
  })
  
  it("Should get the message Hello", async () => {
    const result = await fetch(`${URL}/api/dummy`).then(r => r.json());
    expect(result.msg).to.be.equal("Hello");
  })
  it("Should get the name admin and userName admin@a.dk", async () => {
    const result = await fetch(`${URL}/api/users/admin@a.dk`).then(r => r.json());
    expect(result.name).to.be.equal("admin");
    expect(result.userName).to.be.equal("admin@a.dk");
  })
  it("Should get error message when entering wrong url", async () => {
    const result = await fetch(`${URL}/api/users/add322`).then(r => r.json());
    expect(result.errorCode).to.be.equal(404);
    expect(result.name).to.be.equal("ApiError");
  })
  
    after((done) => {
      server.close(done);
    })
})

import path from "path";
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import { expect } from "chai";
import { Server } from "http";
import fetch from "node-fetch";
import mongo, { MongoClient } from "mongodb";
import { bryptAsync } from "../src/utils/bcrypt-async-helper"
import setup from "../src/config/setupDB"
import { ApiError } from '../src/errors/apiError';
import { USER_COLLECTION_NAME, POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../src/config/collectionNames"
import { positionCreator, getLatitudeInside, getLatitudeOutside } from "../src/utils/geoUtils"


let userCollection: mongo.Collection | null;
let positionCollection: mongo.Collection | null;
let postCollection: mongo.Collection | null;

let server: Server;
const TEST_PORT = "7778"
let client: MongoClient;

const DISTANCE_TO_SEARCH = 100
const MOCHA_TIMEOUT = 5000;

describe("verify all endpoints", () => {
  let URL: string;

  before(async function () {

    this.timeout(MOCHA_TIMEOUT)

    process.env["PORT"] = TEST_PORT;
    process.env["DB_NAME"] = "semester_case_test"

    server = await require("../src/app").server;
    URL = `http://localhost:${process.env.PORT}`;

    client = await setup();
  })

  beforeEach(async () => {
    //Observe, no use of facade, but operates directly on connection
    const db = client.db(process.env.DB_NAME)
    const usersCollection = db.collection(USER_COLLECTION_NAME)
    await usersCollection.deleteMany({})
    const secretHashed = await bryptAsync("secret");

    const team1 = { name: "Team1", userName: "t1", password: secretHashed, role: "team" }
    const team2 = { name: "Team2", userName: "t2", password: secretHashed, role: "team" }
    const team3 = { name: "Team3", userName: "t3", password: secretHashed, role: "team" }

    const status = await usersCollection.insertMany([team1, team2, team3])

    const positionsCollection = db.collection(POSITION_COLLECTION_NAME)
    await positionsCollection.deleteMany({})
    await positionsCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: 30 })
    await positionsCollection.createIndex({ location: "2dsphere" })
    const positions = [
      positionCreator(12.48, 55.77, team1.userName, team1.name, true),
      positionCreator(12.48, getLatitudeInside(55.77, DISTANCE_TO_SEARCH), team2.userName, team2.name, true),
      positionCreator(12.48, getLatitudeOutside(55.77, DISTANCE_TO_SEARCH), team3.userName, team3.name, true),
    ]
    await positionsCollection.insertMany(positions)
    
    const postCollection = db.collection(POST_COLLECTION_NAME) 
    await postCollection.deleteMany({})
    await postCollection.insertOne({
      _id: "Post1",
      task: { text: "2+5", isUrl: false },
      taskSolution: "7",
      location: {
        type: "Point",
        coordinates: [12.49, 55.77]
      }
    });
    
  })

  after(async () => {
    server.close();
    await client.close();
  })

  /**
   * USER endpoints
   */

  it("Should get the message Hello api", async () => {
    const result = await fetch(`${URL}/api/dummy`).then(r => r.json());
    expect(result.msg).to.be.equal("Hello api")
  })

  it("Should get three users", async () => {
    const result = await fetch(`${URL}/api/users`).then(r => r.json());
    expect(result.length).to.be.equal(3)
  })

  it("Should Add the user Jan", async () => {
    const newUser = { name: "Jan Olsen", userName: "jo@b.dk", password: "secret", role: "user" }
    const config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newUser)
    }
    const result = await fetch(`${URL}/api/users`, config).then(r => r.json());
    expect(result.status).to.be.equal("User was added")
  })

  it("Should find the user t1", async () => {
    const result = await fetch(`${URL}/api/users/t1`).then(r => r.json());
    expect(result.name).to.be.equal("Team1")

  })

  it("Should not find the user xxx@b.dk", async () => {
    try {
      const result = await fetch(`${URL}/api/users/xxx@b.dk`).then(r => r.json());
      expect(result.name).not.to.be.equal("Donald Duck")
    }
    catch (err) {
      expect(err instanceof ApiError).to.be.equal(true)
      expect(err.message).to.be.equal("User not found")
    }
  })

  it("Should Remove the user t1", async () => {
    const config = {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    }
    const result = await fetch(`${URL}/api/users/t1`, config).then(r => r.json());
    expect(result.status).to.be.equal("user deleted")
  })

  /**
   * GAME endpoints
   */

  it("Should find gameapi", async function () {
    const result = await fetch(`${URL}/gameapi/dummy`)
      .then(r => r.json());
    expect(result.msg).to.be.equal("Hello gameapi")
  })

  it("Should find team2, since inside range", async function () {
    //  //@ts-ignore
    //  this.timeout(MOCHA_TIMEOUT)
    const newPosition = { "userName": "t1", "password": "secret", "lat": 55.77, "lon": 12.48, "distance": DISTANCE_TO_SEARCH }
    const config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPosition)
    }
    const result = await fetch(`${URL}/gameapi/nearbyplayers`, config).then(r => r.json());
    expect(result.length).to.be.equal(1)
    expect(result[0].userName).to.be.equal("t2")
  })

  it("Should find team2 +team3, since both are inside range", async () => {
    const newPosition = { "userName": "t1", "password": "secret", "lat": 55.77, "lon": 12.48, "distance": DISTANCE_TO_SEARCH + 100 }
    const config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPosition)
    }
    const result = await fetch(`${URL}/gameapi/nearbyplayers`, config).then(r => r.json());
    expect(result.length).to.be.equal(2)
    expect(result[0].userName).to.be.equal("t2")
    expect(result[0].lon).to.be.equal(12.48)
    expect(result[0].lat).to.be.equal(getLatitudeInside(55.77, DISTANCE_TO_SEARCH))
    expect(result[1].userName).to.be.equal("t3")
    expect(result[1].lon).to.be.equal(12.48)
    expect(result[1].lat).to.be.equal(getLatitudeOutside(55.77, DISTANCE_TO_SEARCH))
  })

  it("Should NOT find team2, since not in range", async function () {
    const newPosition = {
      "userName": "t1",
      "password": "secret",
      "lat": 51.77,
      "lon": 12.48,
      "distance": 1
    }
    const config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newPosition)
    }
    const result = await fetch(`${URL}/gameapi/nearbyplayers`, config).then(r => r.json());
    expect(result.length).to.be.equal(0)
  })

  it("Should not find team2, since credentials are wrong", async function () {
    try {
      const newPosition = { "userName": "t2", "password": "wsdfa", "lat": 55.77, "lon": 12.48, "distance": DISTANCE_TO_SEARCH + 100 }
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newPosition)
      }
      const result = await fetch(`${URL}/gameapi/nearbyplayers`, config).then(r => r.json());
    } catch (err) {
      expect(err.message).to.be.equal("wrong username or password!")
      expect(err.code).to.be.equal(403)
    }
  })


  /**
   Response JSON (if found):
     {"postId":"post1", "task": "2+5", isUrl:false}
   * 
   */
  it("Should find Post1, when near", async function () {
    const position = { "postId": "Post1", "lon": 12.49, "lat": 55.77 }
    const config = {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(position)
    }
    const result = await fetch(`${URL}/gameapi/getpostifreached`, config).then(r => r.json());
    expect(result.postId).to.be.equal("Post1")
    expect(result.task).to.be.equal("2+5")
    expect(result.isUrl).to.be.equal(false)
  })

  /**
  Response JSON (if not reached):
    {message: "Post not reached", code: 400} (StatusCode = 400)
   */
  it("Should not find Post1, since no where near", async function () {
    try {
      const position = { "postId": "Post1", "lon": 13, "lat": 15 }
      const config = {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(position)
      }
      await fetch(`${URL}/gameapi/getpostifreached`, config).then(r => r.json());
    } catch (err) {
      expect(err.message).to.be.equal("Post not reached")
      expect(err.code).to.be.equal(400)
    }
  })

})

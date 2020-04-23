import * as mongo from "mongodb"
const MongoClient = mongo.MongoClient;
import setup from "../src/config/setupDB"
//import UserFacade from '../src/facades/userFacadeWithDB';
import GameFacade from '../src/facades/gameFacade';
import { expect } from "chai";
import { bryptAsync } from "../src/utils/bcrypt-async-helper"
import { positionCreator, getLatitudeOutside, getLatitudeInside } from "../src/utils/geoUtils"
import { USER_COLLECTION_NAME, POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../src/config/collectionNames"
import { ApiError } from '../src/errors/apiError';

let userCollection: mongo.Collection | null;
let positionCollection: mongo.Collection | null;
let postCollection: mongo.Collection | null;

let client: mongo.MongoClient;
const DISTANCE_TO_SEARCH = 100

describe("Verify the GameFacade", () => {

  before(async () => {
    client = await setup();
    process.env["DB_NAME"] = "semester_case_test"
    const db = await GameFacade.setDatabase(client)

    if (!db) {
      throw new Error("Database not intialized")
    }
    userCollection = db.collection(USER_COLLECTION_NAME);
    positionCollection = db.collection(POSITION_COLLECTION_NAME)
    postCollection = db.collection(POST_COLLECTION_NAME);

    if (userCollection === null || positionCollection === null || postCollection === null) {
      throw new Error("user, post and/or location- collection not initialized")
    }

  })
  after(async () => {
    await client.close();
  })
  beforeEach(async () => {
    if (userCollection === null || positionCollection === null || postCollection === null) {
      throw new Error("One of required collections is null")
    }
    await userCollection.deleteMany({})
    const secretHashed = await bryptAsync("secret");
    const team1 = { name: "Team1", userName: "t1", password: secretHashed, role: "team" }
    const team2 = { name: "Team2", userName: "t2", password: secretHashed, role: "team" }
    const team3 = { name: "Team3", userName: "t3", password: secretHashed, role: "team" }
    await userCollection.insertMany([team1, team2, team3])

    await positionCollection.deleteMany({})
    await positionCollection.createIndex({ lastUpdated: 1 }, { expireAfterSeconds: 30 })
    await positionCollection.createIndex({ location: "2dsphere" })
    const positions = [
      positionCreator(12.48, 55.77, team1.userName, team1.name, true),
      positionCreator(12.48, getLatitudeInside(55.77, DISTANCE_TO_SEARCH), team2.userName, team2.name, true),
      positionCreator(12.48, getLatitudeOutside(55.77, DISTANCE_TO_SEARCH), team3.userName, team3.name, true),
    ]
    await positionCollection.insertMany(positions)

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

  describe("Verify nearbyPlayers", () => {
    it("Should find (Only) Team2", async () => {
      const playersFound = await GameFacade.nearbyPlayers("t1", "secret", 12.48, 55.77, DISTANCE_TO_SEARCH)
      expect(playersFound.length).to.be.equal(1);
      expect(playersFound[0].userName).to.be.equal("t2")
    })
  })

  describe("Verify nearbyPlayers", () => {
    it("Should not find Team2 (wrong credentials)", async () => {
      try {
        const playersFound = await GameFacade.nearbyPlayers("t1", "xxxxx", 12.48, 55.77, DISTANCE_TO_SEARCH)
        expect(playersFound.code).to.be.equal(403)
      } catch (err) {
      }
    })
  })

  describe("Verify nearbyPlayers", () => {
    it("Should find Team2 and Team3", async () => {
      const playersFound = await GameFacade.nearbyPlayers("t1", "secret", 12.48, 55.77, DISTANCE_TO_SEARCH + 100)
      expect(playersFound.length).to.be.equal(2);
      expect(playersFound[0].userName).to.be.equal("t2")
      expect(playersFound[1].userName).to.be.equal("t3")
    })
  })

  /**
   Response JSON (if found):
    {"postId":"post1", "task": "2+5", isUrl:false}
 * 
 */
  describe("Verify getPostIfReached", () => {
    it("Should find the post since it was reached", async () => {
      const postFound = await GameFacade.getPostIfReached("Post1", 12.49, 55.77)
      expect(postFound.postId).to.be.equal("Post1")
      expect(postFound.task).to.be.equal("2+5")
      expect(postFound.solution).to.be.equal("7")
    })

    /**
    Response JSON (if not reached):
      {message: "Post not reached", code: 400} (StatusCode = 400)
   */
    it("Should NOT find the post since it was NOT reached", async () => {
      try {
        await GameFacade.getPostIfReached("Post1", 13, 15)
      } catch (err) {
        expect(err instanceof ApiError).to.be.equal(true)
        expect(err.message).to.be.equal("Post not reached")
        expect(err.errorCode).to.be.equal(400)
      }
    })
  })


  /**
   * updating location
   */
  describe("Verify location updating facade", () => {
    it("Should update location", async () => {
      const updated = await GameFacade.updateLocation("t1", 13.0, 15.0)
      console.log("Should update location", updated)
      expect(updated.userName).to.be.equal("t1")
      expect(updated.lon).to.be.equal(13.0)
      expect(updated.lat).to.be.equal(15.0)
    })
  })
})
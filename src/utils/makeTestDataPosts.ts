import path from "path";
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from "mongodb";
import { bryptAsync } from "./bcrypt-async-helper"
const MongoClient = mongo.MongoClient;
import { positionCreator } from "./geoUtils"
import { USER_COLLECTION_NAME, POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../config/collectionNames"

const uri = process.env.CONNECTION || ""

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

(async function makeTestData() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME)
    const usersCollection = db.collection(USER_COLLECTION_NAME)
    await usersCollection.deleteMany({})
    await usersCollection.createIndex({ userName: 1 }, { unique: true })
    const secretHashed = await bryptAsync("secret");
    const team1 = { name: "Team1", userName: "martin", password: secretHashed, role: "team" }
    const team2 = { name: "Team2", userName: "peter", password: secretHashed, role: "team" }
    const team3 = { name: "Team3", userName: "isabel", password: secretHashed, role: "team" }
    const team4 = { name: "Team4", userName: "esther", password: secretHashed, role: "team" }
    const team5 = { name: "Team5", userName: "bettina", password: secretHashed, role: "team" }
    const admin = { name: "admin", userName: "admin", password: secretHashed, role: "admin" }

    const status = await usersCollection.insertMany([team1, team2, team3, team4, team5, admin])

    const positionsCollection = db.collection(POSITION_COLLECTION_NAME)
    await positionsCollection.deleteMany({})
    await positionsCollection.createIndex({ "lastUpdated": 1 }, { expireAfterSeconds: 30 })
    await positionsCollection.createIndex({ location: "2dsphere" })
    const positions = [
      positionCreator(12.539, 55.887, team1.userName, team1.name, true),
      positionCreator(12.539, 55.900, team2.userName, team2.name, true),
      positionCreator(12.539, 55.913, team3.userName, team3.name, true),
      positionCreator(12.539, 55.926, team4.userName, team4.name, true),
      positionCreator(12.539, 55.939, team5.userName, team3.name, true),
      positionCreator(12.51, 55.77, "xxx", "yyy", false),
    ]
    const locations = await positionsCollection.insertMany(positions)

    const postCollection = db.collection(POST_COLLECTION_NAME)
    await postCollection.deleteMany({})
    const posts = await postCollection.insertMany([{
      _id: "Post1",
      task: { text: "1+1", isUrl: false },
      taskSolution: "2",
      location: {
        type: "Point",
        coordinates: [12.49, 55.77]
      }
    },
    {
      _id: "Post2",
      task: { text: "4-4", isUrl: false },
      taskSolution: "0",
      location: {
        type: "Point",
        coordinates: [12.4955, 55.774]
      }
    },
    {
      _id: "Post3",
      task: { text: "11+9", isUrl: false },
      taskSolution: "20",
      location: {
        type: "Point",
        coordinates: [12.51211881637573, 55.91292233950267]
      }
    },
    {
      _id: "Post4",
      task: { text: "14+24", isUrl: false },
      taskSolution: "38",
      location: {
        type: "Point",
        coordinates: [12.49869704246521, 55.909533865947076]
      }
    }
  ]);
    console.log(`Inserted ${posts.insertedCount} test Posts`)

    console.log(`Inserted ${status.insertedCount} test users`)
    console.log(`Inserted ${locations.insertedCount} test Locationa`)
    console.log(`NEVER, NEVER, NEVER run this on a production database`)

  } catch (err) {
    console.error(err)
  } finally {
    client.close();
  }
})()
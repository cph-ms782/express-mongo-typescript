import path from "path";
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import * as mongo from "mongodb";
import { bryptAsync } from "./bcrypt-async-helper"
const MongoClient = mongo.MongoClient;

const uri = process.env.CONNECTION || ""
//const uri = "mongodb+srv://fullstackUser:lyngbymongo@fullstack-cluster-ikeoi.mongodb.net/test?retryWrites=true&w=majority";


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

(async function makeTestData() {
    try {
        await client.connect();
        const db = client.db(process.env.DB_NAME)
        const usersCollection = db.collection("users")
        await usersCollection.deleteMany({})
        const secretHashed = await bryptAsync("secret");
        const status = await usersCollection.insertMany([
            { name: "Team1", userName: "t1", password: secretHashed, role: "team" },
            { name: "Team2", userName: "t2", password: secretHashed, role: "team" },
            { name: "Team3", userName: "t3", password: secretHashed, role: "team" }
        ])
        console.log(`Inserted ${status.insertedCount} test users`)
        console.log(`NEVER, NEVER, NEVER run this on a production database`)

    } catch (err) {
        console.error(err)
    } finally {
        client.close();
    }
})()
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import IGameUser from '../interfaces/GameUser';
import { bryptAsync, bryptCheckAsync } from "../utils/bcrypt-async-helper"
import * as mongo from "mongodb"
import { ApiError } from "../errors/apiError"
import { USER_COLLECTION_NAME } from "../config/collectionNames"

let userCollection: mongo.Collection;

export default class UserFacade {

    static async setDatabase(client: mongo.MongoClient) {
        const dbName = process.env.DB_NAME;
        if (!dbName) {
            throw new Error("Database name not provided")
        }
        try {
            if (!client.isConnected()) {
                await client.connect();
            }
            userCollection = client.db(dbName).collection(USER_COLLECTION_NAME);
            await userCollection.createIndex({ userName: 1 }, { unique: true })

            return client.db(dbName);

        } catch (err) {
            console.error("Could not create connect", err)
        }
    }

    static async addUser(user: IGameUser): Promise<string> {
        const hash = await bryptAsync(user.password);
        let newUser = { ...user, password: hash }
        try {
            const result = await userCollection.insertOne(newUser);
            return "User was added";
        } catch (err) {
            if (err.code === 11000) {
                throw new ApiError("This userName is already taken", 400)
            }
            throw new ApiError(err.errmsg, 400)
        }
    }

    static async changeUser(user: IGameUser): Promise<string> {
        const hash = await bryptAsync(user.password);
        let changedUser ={ $set: { ...user, password: hash }};
        try {
            await userCollection.updateOne(
                { userName : user.userName },
                changedUser
            );
            return "User was changed";
        } catch (err) {
            throw new ApiError(err.errmsg, 400)
        }
    }

    static async deleteUser(userName: string): Promise<string> {
        const res = await userCollection.findOneAndDelete({
            userName
        })
        if (res.value) {
            return "user deleted";
        }
        throw new ApiError("Error in deleting user", 400);
    }

    static async getAllUsers(proj?: object): Promise<Array<any>> {
        const all = await userCollection.find(
            {},
            { projection: proj }
        );
        return all.toArray();
    }

    static async getUser(userName: string, proj?: object): Promise<any> {
        const user = await userCollection.findOne(
            { userName }, // shortcut for {userName: userName}
            { projection: proj }
        )
        if (!user) {
            throw new ApiError("User not found", 404);
        }
        return user;
    }

    static async checkUser(userName: string, password: string): Promise<boolean> {
        let userPassword = "";
        try {
            const user = await UserFacade.getUser(userName);
            userPassword = user.password;
        } catch (err) { }
        const status = await bryptCheckAsync(password, userPassword);
        return status
    }
}

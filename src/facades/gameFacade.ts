const debug = require("debug")("game-project");
const path = require('path')
require('dotenv').config({ path: path.join(process.cwd(), '.env') })
import gju from 'geojson-utils';
import * as mongo from "mongodb"
import UserFacade from "./userFacadeWithDB"
import { ApiError } from "../errors/apiError";
import IPosition from '../interfaces/Position';
import IPost from '../interfaces/Post';
import IPoint from '../interfaces/Point';
import { POSITION_COLLECTION_NAME, POST_COLLECTION_NAME } from "../config/collectionNames"

let positionCollection: mongo.Collection;
let postCollection: mongo.Collection;
const EXPIRES_AFTER = 30;

export default class GameFacade {

    static readonly DIST_TO_CENTER = 15

    /**
     * 
     * @param client 
     */
    static async setDatabase(client: mongo.MongoClient) {
        const dbName = process.env.DB_NAME;
        if (!dbName) {
            throw new Error("Database name not provided")
        }

        //This facade uses the UserFacade, so set it up with the right client
        await UserFacade.setDatabase(client);

        try {
            if (!client.isConnected()) {
                await client.connect();
            }

            positionCollection = client.db(dbName).collection(POSITION_COLLECTION_NAME);
            //1) Create expiresAfterSeconds index on lastUpdated
            await positionCollection.createIndex({ lastUpdated: 1 }, { expireAfterSeconds: EXPIRES_AFTER })
            //2) Create 2dsphere index on location
            await positionCollection.createIndex({ location: "2dsphere" })

            postCollection = client.db(dbName).collection(POST_COLLECTION_NAME);
            await postCollection.createIndex({ location: "2dsphere" })
            return client.db(dbName);

        } catch (err) {
            console.error("Could not connect", err)
        }
    }

    /**
     * 
     * @param longitude 
     * @param latitude 
     */
    static async makePoint(longitude: number, latitude: number): Promise<any> {
        const point = { type: 'Point', coordinates: [longitude, latitude] };
        return point;
    }

    /**
     * 
     * @param point 
     * @param polygon 
     */
    static async pointInPolygon(point: any, polygon: any): Promise<any> {
        const inside = gju.pointInPolygon(point, {
            type: 'Polygon',
            coordinates: polygon.features[0].geometry.coordinates
        });
        return inside;
    }

    /**
     * 
     * @param userName 
     * @param password 
     * @param lon 
     * @param lat 
     * @param distance 
     */
    static async nearbyPlayers(userName: string, password: string, lon: number, lat: number, distance: number): Promise<any> {
        let user;
        try {
            const check: boolean = await UserFacade.checkUser(userName, password)
            if (!check) {
                throw new ApiError("wrong username or password!", 403)
            }
        } catch (err) {
            return { "code": err.code, "message": err.message }
        }
        try {
            const date = new Date();
            const userGeometry: any = {
                type: "Point",
                coordinates: [
                    lon,
                    lat
                ]
            };

            const foundAndUpdatePlayer = GameFacade.findAndUpdateUser(userName, userGeometry)

            const foundPlayers: any[] = await GameFacade.findNearbyPlayers(
                userName,
                userGeometry,
                distance
            )

            // If anyone found,  format acording to requirements
            // [{"userName": "team2", "lat": 4, "lon" : 10}, {..}, ..]
            const formatted: any[] = foundPlayers.map((player) => {
                return {
                    userName: player.userName,
                    lon: player.location.coordinates[0],
                    lat: player.location.coordinates[1],
                }
            })
            return formatted;
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param clientUserName 
     * @param point 
     * @param distance 
     */
    static async findNearbyPlayers(clientUserName: string, point: IPoint, distance: number): Promise<Array<IPosition>> {
        try {
            const found = await positionCollection.find(
                {
                    userName: { $ne: clientUserName },
                    location:
                    {
                        $near:
                        {
                            $geometry: {
                                type: "Point",
                                coordinates: [point.coordinates[0], point.coordinates[1]]
                            },
                            $maxDistance: distance
                        }
                    }
                }
            )
            return found.toArray();
        } catch (err) {
            throw err;
        }
    }

    /**
     * 
     * @param userName 
     * @param position 
     */
    static async findAndUpdateUser(userName: string, position: IPosition): Promise<boolean> {
        const found: any = await positionCollection.findOneAndUpdate(
            { userName },
            { $set: { position } },
            { upsert: true, returnOriginal: false },
            function (err, doc) {
                if (err) {
                    throw new ApiError("Error in deleting user", 400);
                } else {
                    console.log("Updated");
                    return false;
                }
            }
        );
        return found;
    }

    /**
     * 
     * @param postId 
     * @param lat 
     * @param lon 
     */
    static async getPostIfReached(postId: string, lon: number, lat: number): Promise<any> {
        const postGeometry: any = {
            type: "Point",
            coordinates: [
                lon,
                lat
            ]
        };
        try {
            const post: IPost | null = await postCollection.findOne(
                {
                    _id: postId,
                    location:
                    {
                        $near: {
                            $geometry: postGeometry,
                            $maxDistance: 10
                        }
                    }
                }
            )
            if (post === null) {
                throw new ApiError("Post not reached", 400);
            }
            return { postId: post._id, task: post.task.text, isUrl: post.task.isUrl };
        } catch (err) {
            throw err;
        }
    }

    /**
     *   You can use this if you like, to add new post's via the facade
     * 
     * @param name 
     * @param taskTxt 
     * @param isURL 
     * @param taskSolution 
     * @param lon 
     * @param lat 
     */
    static async addPost(
        name: string,
        taskTxt: string,
        isURL: boolean,
        taskSolution: string,
        lon: number,
        lat: number
    ): Promise<IPost> {
        const position = { type: "Point", coordinates: [lon, lat] };
        const status = await postCollection.insertOne({
            _id: name,
            task: { text: taskTxt, isURL },
            taskSolution,
            location: {
                type: "Point",
                coordinates: [lon, lat]
            }
        });
        const newPost: any = status.ops;
        return newPost as IPost
    }

    /**
     * 
     * @param firstUserPoint 
     * @param findObjectsRadius 
     * @param players 
     */
    static async geometryWithinRadius(firstUserPoint: any, findObjectsRadius: number, players: any[]): Promise<any> {
        let foundPlayers: any = [];

        for (let i in players) {
            const arrayPlayerPoint: any = players[i].geometry;
            if (arrayPlayerPoint != firstUserPoint) {
                if (gju.geometryWithinRadius(arrayPlayerPoint, firstUserPoint, findObjectsRadius)) {
                    foundPlayers.push(players[i]);
                }
            }
        }
        return foundPlayers;
    }

    /**
     * 
     * @param point1 
     * @param point2 
     */
    static async pointDistance(point1: any, point2: any): Promise<number> {
        return gju.pointDistance(point1, point2);
    }
}

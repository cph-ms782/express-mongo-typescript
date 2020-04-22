require('dotenv').config();
import express from "express";
import gameFacade from "../facades/gameFacade";
const router = express.Router();
import { ApiError } from "../errors/apiError";
import authMiddleware from "../middlewares/basic-auth";
import * as mongo from "mongodb";
import setup from "../config/setupDB";
const MongoClient = mongo.MongoClient;
import { gameArea } from "../data/gameData";
import { players } from "../data/gameData";
import IPost from "../interfaces/Post";

const USE_AUTHENTICATION: boolean = Boolean(process.env.USE_AUTHENTICATION);

(async function setupDB() {
    const client = await setup()
    gameFacade.setDatabase(client)
})()

if (USE_AUTHENTICATION) {
    router.use(authMiddleware)
}

interface IPolygonForClient {
    [coordinates: string]: number
}

const polygonForClient: IPolygonForClient = {};
polygonForClient.coordinates = gameArea.coordinates[0].map(point => {
    return { latitude: point[1], longitude: point[0] }
})

//Returns a polygon, representing the gameArea
router.get("/gamearea", (req, res) => {
    res.json(polygonForClient);
});

/**
 *   Find Players near the caller using coordinates
 */
router.get('/findnearbyplayers/:lon/:lat/:rad', async (req: any, res: any, next: any) => {
    try {
        const lon: number = Number(req.params.lon)
        const lat: number = Number(req.params.lat)
        const userGeometry: any = {
            "type": "Point",
            "coordinates": [
                lon,
                lat
            ]
        };
        const foundPlayers: any[] = await gameFacade.geometryWithinRadius(
            userGeometry,
            Number(req.params.rad),
            players);
        return res.json(foundPlayers);
    } catch (err) {
        next(err);
    }
});

/**
 * 
 */
router.post('/nearbyplayers', async (req: any, res: any, next: any) => {
    try {
        const foundPlayer: any[] = await gameFacade.nearbyPlayers(
            req.body.userName,
            req.body.password,
            req.body.lon,
            req.body.lat,
            req.body.distance
        );
        console.log("foundPlayer", foundPlayer)
        return res.json(foundPlayer);
    } catch (err) {
        next(err);
    }
})

/**
 * 
 */
router.post('/updateposition', async (req: any, res: any, next: any) => {
    console.log("updateposition")
    try {
        const foundPosition: any[] = await gameFacade.updateLocation(
            req.body.userName,
            req.body.lon,
            req.body.lat,
        );
        console.log("foundPosition", foundPosition)
        return res.json(foundPosition);
    } catch (err) {
        next(err);
    }
})

/**
 *  Find Distance between caller, and another player
 */
router.get('/distancetouser/:lon/:lat/:username', async (req: any, res: any, next: any) => {
    try {
        const user1: any = players[0];
        const point1: any = user1.geometry;
        const user2: any = players.find((player) => {
            return player.properties.name == req.params.username;
        });
        const point2: any = await gameFacade.makePoint(Number(req.params.lon), Number(req.params.lat));

        if (user2) {
            const distance: number = await gameFacade.pointDistance(point1, point2);
            return res.json({
                "distance": distance,
                "to": user2.properties.name
            });
        };
        return res.json(
            {
                "msg": "User not found"
            });
    } catch (err) {
        next(err);
    }
});

/**
 * Check whether the caller is located in the Game Area
 */
router.get('/isuserinarea/:lon/:lat', async (req: any, res: any, next: any) => {
    try {
        if (USE_AUTHENTICATION) {
            const point: any = await gameFacade.makePoint(Number(req.params.lon), Number(req.params.lat));
            const inside: any = await gameFacade.pointInPolygon(point, gameArea);
            if (inside) {
                return res.json({
                    status: true,
                    msg: 'Point was inside the tested polygon'
                });
            }
            return res.json({
                status: false,
                msg: 'Point was NOT inside tested polygon'
            });
        }
    } catch (err) {
        next(err);
    }
});

/**
    Request JSON: 
        {"postId":"post1", "lat":3, "lon": 5}
    Response JSON (if found):
        {"postId":"post1", "task": "2+5", isUrl:false}
    Response JSON (if not reached):
        {message: "Post not reached", code: 400} (StatusCode = 400)
 */
router.post('/getpostifreached', async (req: any, res: any, next: any) => {
    try {
        const post: IPost = await gameFacade.getPostIfReached(
            req.body.postId,
            req.body.lon,
            req.body.lat
        )
        return res.json(post)
    } catch (err) {
        next(err);
    }
});

module.exports = router;
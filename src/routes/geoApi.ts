require('dotenv').config();
import express from "express";
import geoFacade from "../facades/geo";
const router = express.Router();
import { ApiError } from "../errors/apiError";
import authMiddleware from "../middlewares/basic-auth";
import * as mongo from "mongodb";
import setup from "../config/setupDB";
const MongoClient = mongo.MongoClient;
import { gameArea } from "../data/gameData";
import { players } from "../data/gameData";

const USE_AUTHENTICATION: boolean = Boolean(process.env.USE_AUTHENTICATION);

// (async function setupDB() {
//     const client = await setup()
//     userFacade.setDatabase(client)
// })()

if (USE_AUTHENTICATION) {
    router.use(authMiddleware)
}

// Find Players near the caller
router.get('/findnearbyplayers/:lon/:lat/:rad', async (req: any, res: any, next: any) => {
    try {
        const user1: any = players[0];
        const foundPlayers: any[] = await geoFacade.geometryWithinRadius(user1.geometry, Number(req.params.rad), players);
        return res.json(foundPlayers);
    } catch (err) {
        next(err);
    }
});

// Find Distance between caller, and another player
router.get('/distancetouser/:lon/:lat/:username', async (req: any, res: any, next: any) => {
    try {
        const user1: any = players[0];
        const point1: any = user1.geometry;
        const user2: any = players.find((player) => {
            return player.properties.name == req.params.username;
        });
        const point2: any = await geoFacade.makePoint(Number(req.params.lon), Number(req.params.lat));

        if (user2) {
            const distance: number = await geoFacade.pointDistance(point1, point2);
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

// Check whether the caller is located in the Game Area
router.get('/isuserinarea/:lon/:lat', async (req: any, res: any, next: any) => {
    try {
        const point: any = await geoFacade.makePoint(Number(req.params.lon), Number(req.params.lat));
        const inside: any = await geoFacade.pointInPolygon(point, gameArea);
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
    } catch (err) {
        next(err);
    }
});


module.exports = router;
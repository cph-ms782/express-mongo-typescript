const debug = require("debug")("game-project");
import { ApiError } from "../errors/apiError";
import gju from 'geojson-utils';

function dummyReturnPromise<T>(val: T | null, err: string = "Unknown Error", code: number = 500): Promise<T> {
    return new Promise<T>((resolve, reject) => {
        setTimeout(() => {
            if (!val) { reject(new ApiError(err, code)) }
            else resolve(val);
        }, 0);
    })
}

export default class GeoFacade {

    static async makePoint(longitude: number, latitude: number): Promise<any> {
        // const point = { type: 'Point', coordinates: [ req.params.lon, req.params.lat ] };
        const point = { type: 'Point', coordinates: [longitude, latitude] };
        return point;
    }

    static async pointInPolygon(point: any, polygon: any): Promise<any> {
        //For endpoint-1, use the method: pointInPolygon(..) (Make sure your gameArea polygon matches the polygon used in the example

        // gju.pointInPolygon({"type":"Point","coordinates":[3,3]},
        //              {"type":"Polygon", "coordinates":[[[0,0],[6,0],[6,6],[0,6]]]})
        // [{"type":"Point","coordinates":[3,3]}]

        // gju.pointInPolygon({"type":"Point","coordinates":[-1,-1]},
        //                  {"type":"Polygon", "coordinates":[[[0,0],[6,0],[6,6],[0,6]]]})
        // false
        const inside = gju.pointInPolygon(point, {
            type: 'Polygon',
            coordinates: polygon.features[0].geometry.coordinates
        });
        return inside;
    }

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

    static async pointDistance(point1: any, point2: any): Promise<number> {
        //For endpoint-3, first find the other player in the list of players, and then use the method: pointDistance(..)

        // gju.pointDistance({type: 'Point', coordinates:[-122.67738461494446, 45.52319466622903]},
        //               {type: 'Point', coordinates:[-122.67652630805969, 45.52319466622903]})
        // 66.86677669313518

        return gju.pointDistance(point1, point2);
    }
}

require('dotenv').config();
import express from "express";
import userFacade from "../facades/userFacadeWithDB";
import gameFacade from "../facades/gameFacade";
const router = express.Router();
import authMiddleware from "../middlewares/basic-auth";
import setup from "../config/setupDB";
let graphqlHTTP = require('express-graphql');
let { buildSchema, GraphQLScalarType } = require('graphql');
import GameUser from "../interfaces/GameUser";

const USE_AUTHENTICATION: boolean = Boolean(process.env.USE_AUTHENTICATION);

(async function setupDB() {
    const client = await setup()
    userFacade.setDatabase(client)
})()


const schema = buildSchema(`
scalar Coordinates

type User {
    name: String
    userName: String
    role: String
    password: String
}

type coordinatesLatLon {
    latitude: Float!
    longitude: Float!
}

type Polygon {
    coordinates: [[Coordinates]!]!
}

input UserInput {
    name: String
    userName: String
    password: String
}

type Query {
    user(userName: String): User
    users : [User]!
    gamearea: Polygon!
}


type Mutation {
    createUser(input: UserInput): String
    updateUser(input: UserInput): String
    deleteUser(userName:String!):String
}
`)

if (USE_AUTHENTICATION) {
    router.use(authMiddleware)
}

let root = {
    Coordinates: new GraphQLScalarType({
        name: 'Coordinates',
        description: 'A set of coordinates. x, y',
        parseValue(value) {
            return value;
        },
        serialize(value) {
            return value;
        },
        parseLiteral(ast) {
            return ast.value;
        },
    }),
    user: async ({ userName }) => {
        const { name, role } = await userFacade.getUser(userName);

        return { name, userName, role, password: "not disclosured" };
    },
    users: async () => {
        const users = await userFacade.getAllUsers();
        const usersDTO = users.map((user) => {
            const { name, userName, role } = user;
            return { name, userName, role }
        })
        return usersDTO;
    },
    createUser: async (inp: any) => {
        const { input } = inp;
        try {
            const newUser: GameUser = {
                name: input.name,
                userName: input.userName,
                password: input.password,
                role: "user"
            }

            const status = await userFacade.addUser(newUser)
            return status;

        } catch (err) {
            throw err;
        }
    },
    updateUser: async ( inp: any) => {
        const { input } = inp;
        try {
            const changedUser: GameUser = {
                name: input.name,
                userName: input.userName,
                password: input.password,
                role: "user"
            }

            const status = await userFacade.changeUser(changedUser)
            return status;

        } catch (err) {
            throw err;
        }
    },
    deleteUser: async ( { userName }) => {
        try {
            const status = await userFacade.deleteUser(userName)
            return status;

        } catch (err) {
            throw err;
        }
    },
    gamearea: async () => {
        try {
            const area = await gameFacade.polygonForWeb()
            return area;
        } catch (err) {
            throw err;
        }

    },

};

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

module.exports = router;
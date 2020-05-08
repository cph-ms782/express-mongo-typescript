require('dotenv').config();
import express from "express";
import userFacade from "../facades/userFacadeWithDB";
const router = express.Router();
// import { ApiError } from "../errors/apiError";
import authMiddleware from "../middlewares/basic-auth";
// import * as mongo from "mongodb";
import setup from "../config/setupDB";
// const MongoClient = mongo.MongoClient;
let graphqlHTTP = require('express-graphql');
let { buildSchema } = require('graphql');
import GameUser from "../interfaces/GameUser";
import UserInput from "../interfaces/UserInput";
import { ApiError } from "../errors/apiError";

const USE_AUTHENTICATION: boolean = Boolean(process.env.USE_AUTHENTICATION);

(async function setupDB() {
    const client = await setup()
    userFacade.setDatabase(client)
})()

const schema = buildSchema(`
type User {
    name: String
    userName: String
    role: String
    password: String
}

input UserInput {
    name: String
    userName: String
    password: String
}

type Query {
    users : [User]!
}
type Mutation {
    createUser(input: UserInput): String
}
`)

if (USE_AUTHENTICATION) {
    router.use(authMiddleware)
}

//Only if we need roles
// router.use("/", (req: any, res, next) => {
//     if (USE_AUTHENTICATION) {
//         const role = req.role;
//         if (role != "admin") {
//             throw new ApiError("Not Authorized", 403)
//         }
//         next();
//     }
// })


// The root provides a resolver function for each API endpoint
let root = {
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

};

router.use('/', graphqlHTTP({
    schema: schema,
    rootValue: root,
    graphiql: true,
}));

module.exports = router;
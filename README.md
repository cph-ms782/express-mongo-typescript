cph-ms782, Martin Bøgh Sander-Thomsen

[]{#anchor}Fullstack Javascript

[]{#anchor-1}Period-2

[]{#anchor-2}Node, Express with TypeScript, JavaScript Backend Testing,
MongoDB and Geo-location

Explain Pros & Cons in using Node.js + Express to implement your Backend
compared to a strategy using, for example, Java/JAX-RS/Tomcat

**Pros:**

-   It's easier to setup and run
-   You can attach parameters to request object during run (for example
    adding user role)
-   \#\#\#todo

**Cons:**

-   \#\#\#todo

\#\#\#\#todo

Explain the difference between *Debug outputs* and *ApplicationLogging*.
What's wrong with console.log(..) statements in our backend code.

***console.log(...) statements are blocking***

Demonstrate a system using application logging and environment
controlled debug statements.

TODO link

[app.ts](http://docs.google.com/week10+11/express-exercises-day1/src/app.ts)

[logger.ts](http://docs.google.com/week10+11/express-exercises-day1/src/middlewares/logger.ts)

Using the debug package Install the debug package (npm install debug)
Add the following declaration to your local **.env-file**:

DEBUG=game-case

In the start of your file:

require('dotenv').config();

const debug = require("debug")("game-case");

Then, whenever you have done console.log("Hello"), do debug("Hello")

Explain, using relevant examples, concepts related to testing a REST-API
using Node/JavaScript/Typescript + relevant packages

[builtin node
assert](http://docs.google.com/week10+11/express-exercises-day1/test/simpleDemo.ts)

[Mocha
Chai](http://docs.google.com/week10+11/express-exercises-day1/test/simpleDemoWithChai.ts)

\*\* Example async:\*\*

it("Should eventually find number of files in temp folder \" + folder,
async function () { try { const files: any = findFiles("./\" + folder,
".txt");

expect(files.length).to.be.equal(5); } catch (err) { //Observe -- normal
try-catch, when you use async-await // expect(err).to.be.equal("Wrong
arguments"); }})

[REST
test](http://docs.google.com/week10+11/express-exercises-day1/test/simpleRestTest.ts)

Explain a setup for Express/Node/Test/Mongo-DB development with
Typescript, and how it handles \"secret values\", debug and testing.

**Using middleware, you can intercepts requests before the rest routing
is done and in the "layer" you can insert \"security\"**

\#\#\#\#todo

( )

Explain, preferably using an example, how you have deployed your
node/Express applications, and which of the Express Production best
practices you have followed.

Explain possible steps to deploy many node/Express servers on the same
droplet, how to deploy the code and how to ensure servers will continue
to operate, even after a droplet restart.

Explain, your chosen strategy to deploy a Node/Express application
including how to solve the following deployment problems:

-   Ensure that your Node-process restarts after a (potential) exception
    that closed the application
-   Ensure that your Node-process restarts after a server (Ubuntu)
    restart

**Use nodemon (man behøver ikke skrive hvilken il der skal startes, så
længe den er specificeret main i package.json filen)**

-   Ensure that you can run "many" node-applications on a single droplet
    on the same port (80)

I Digital Ocean dns server indstilles hvert sub-domæne til at pege på
den samme droplet (**express1**.server.com, **express2**.server.com
osv).

Ved at ændre i nginx opsætningen på linux serveren, så den kan kan
håndtere forskellige sub-domæner. Første domæne vil have følgende
opsætningen i **/etc/nginx/sites-enabled/default**. Express1 og port
5000. Den næste vil hedde express2 og 5002.

Start flere express servere med forskellige portnumre (5000 og 5001)

server\_name **express1**.server.com;

location / {

proxy\_pass http://localhost:**5000**;

proxy\_http\_version 1.1;

proxy\_set\_header Upgrade \$http\_upgrade;

proxy\_set\_header Connection \'upgrade\';

proxy\_set\_header Host \$host;

proxy\_cache\_bypass \$http\_upgrade;

}

Explain, using relevant examples, the Express concept; middleware.

**Middleware is code running after** var app = express() where the
request object enters the code and before the routing part

\#\#\#\#todo

Explain, using relevant examples, your strategy for implementing a
REST-API with Node/Express + TypeScript and demonstrate how you have
tested the API.

Explain, using relevant examples, how to test JavaScript/Typescript
Backend Code, relevant packages (Mocha, Chai etc.) and how to test
asynchronous code.

NoSQL and MongoDB

*Explain*, generally, what is meant by a NoSQL database.

En NoSQL-database er en database der giver dig mulighed for at gemme og
hente data, der ikke er omhyggeligt modelleret på en tabelform, som du
skal med en relational database.

*Explain* Pros & Cons in using a NoSQL database like MongoDB as your
data store, compared to a traditional Relational SQL Database like
MySQL.

-   Ting går lidt hurtigere (hvis man har valgt det rigtige scenarie)
-   kan håndtere store mængder data
-   behøver ikke at bruge et bestemt skema at lægge data ind \#\#todo

*Explain* about indexes in MongoDB, how to create them, and
*demonstrate* how you have used them.

*Explain*, *using your own code* examples, how you have used some of
MongoDB\'s \"special\" indexes like *TTL* and *2dsphere and perhaps also
the Unique Index.*

*Demonstrate*, using a REST-API *you have designed*, how to perform all
CRUD operations on a MongoDB

*Explain*, using a *relevant example*, a full JavaScript backend
including relevant test cases to test the REST-API (not on the
production database)

 Demonstrate, using your own code-samples, decisions you have made
regarding → normalization vs denormalization

[]{#anchor-3}Geo-location and Geojson

 Explain and demonstrate basic Geo-JSON, involving as a minimum, Points
and Polygons

GeoJSON er en måde at repræsentere geografiske data på. Det er et åbent
standardformat designet til at repræsentere enkle geografiske
funktioner.

 Explain and demonstrate ways to create Geo-JSON test data

Når der testes bruges normale metoder til at oprette data. En forskel
dog er hvor lang tid at positionen overlever i databasen da optionerne
**lastUpdated** og **expiresAfterSeconds** kan være sat så positionerne
forsvinder efter kort tid. Derfor er det praktisk at sætte lastUpdated
langt ude i fremtiden, så den ikke forsvinder så hurtigt.

[*Opretning af test
data*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/test/gameFacadeTest.ts#L52)
[*positionCreator*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/utils/geoUtils.ts#L19)

[*Test kode*](http://./test/gameFacadeTest.ts)

 Explain the typical order of longitude and latitude used by Server-Side
API's and Client-Side API's

**longitude, latitude (som X,Y) brugt af de fleste formater og er Open
Geospatial Consortium's anbefaling**

**latitude, longitude (som Y,X) brugt især af Google, map software og
client-side teknologier (inkl. Airbnb's, google maps)**

**Udvikleren er ansvarlig for at finde ud af, hvad der bruges.**

 Explain and demonstrate a REST API that implements geo-features, using
a relevant geo-library and plain JavaScript

Ved hjælp af npm modulet 'geojson-utils' kan man lave let lave geo
beregninger, som;

-   hvor langt er der imellem to punkter
    [*facade*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/facades/gameFacade.ts#L273)
    [*REST*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/routes/gameApi.ts#L70)
-   er et punkt indenfor en geometri
    [*facade*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/facades/gameFacade.ts#L240)
    [*REST*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/routes/gameApi.ts#L98)
-   hvilke punkter er indenfor en geometri.
    [*facade*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/facades/gameFacade.ts#L254)
    REST er overtaget af mongoDB versionen nedenunder

Kode [*facade*](http://./src/facades/gameFacade.ts) [*REST
API*](http://./src/routes/gameApi.ts)

**TODO : demonstrate**

 Explain and demonstrate a REST API that implements geo-features, using
Mongodb's geospatial queries and indexes.

Med mongoDB kan man gemme lokationer og finde interne relationer imellem
disse. Ved at oprette geo-indexes (som f.eks. {location: \"2dsphere\"}),
kan man søge på disse ved hjælp af mongoDB commandoer som .**find()**
eller .**findAndUpdateUser()**. I søgningen kan man specificere om man
vil sætte en position ( \$**set**: {position} eller finde personer i
nærheden (\$**near**: {\$**geometry**, \$**maxDistance**} ).

Man kan sætte nogle options ved disse søgninger. **upsert** sørger for
at der oprettes et nyt dokument hvis det ikke findes i forvejen, og
**returnOriginal** der returnerer det opdaterede værdig (i modsætning
til default der er at returnere den gamle værdi)**e**

-   Spillere i nærheden
    [*facade*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/facades/gameFacade.ts#L72)
    [*query*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/facades/gameFacade.ts#L121)
    [*REST*](https://github.com/cph-ms782/express-mongo-typescript/blob/bb5e7088dc8ff47d042a67a0a68aadeb2793c0e8/src/routes/gameApi.ts#L52)

**TODO : demonstrate**

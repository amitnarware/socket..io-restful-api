
const { sequelize } = require("./src/database");
const express = require("express")
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const {body,validateResult} = require("express-validator");
const {createConnection} = require("typeorm");
const cacheManager = require("cache-manager");
const socketIO = require("socket.io");
const expressSession = require("express-session");
const sharedSession = require("express-socket.io-session");
const User = require("./src/entities/User");
const path = require('path');



const app = express()
const port = 3000;

app.use(express.json());
app.use(cookieParser());

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const secretKey = "amit";

// cache manager instance
const cache = cacheManager.caching({ store:"memory",max:100, ttl:60});

// Create a session store
const session = expressSession({
    secret:"amit",
    resave:true,
    saveUninitialized:true
})

createConnection()
.then(() => {
    console.log("connected to the database");

   // Route with caching
app.get("/cached-route",async(req,res) => {
    const cacheResult = await cache.get("caached-route");

    if(cacheResult){
        return res.json({data: cacheResult, source:"cache"});
    }

    //   Fetch data from the database
    const result = await fetchDataFromDatabase();

    // Cache the result
    cache.set("cached-route", result);
    res.json({data:result, source:"database"});
})

// Authenticate middleware
const Authenticate = (req,res,next) => {
    const token = req.cookies['authToken'];

    if(!token){
        return res.status(401).json({message:"Unauthorized"});
    }
    try{
        const decoded = jwt.verify(token,secretKey);
        req.userId = decoded.userId;
        next();
    }catch(error){
        return res.status(401).json({message:"Invalid token"});
    }
};
app.post("/login",(req,res) => {
    const {username} = req.body;
    const userId = "123";
    const token = jwt.sign({userId},secretKey);
    res.json({message:"Login succesful"});
})

app.post("/login",body("username").notEmpty(),(req,res) => {
    const errors = validateResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
})
app.get("/protected",Authenticate,(req,res) => {
    res.json({message:"Protected route", userId:req.userId});
})


//    Intialize Socket.io

 const server = app.listen(port,() => {
    console.log(`server is running at http://localhost:${port}`)
})
const io = socketIO(server);

//  express session middleware for Socket.IO
io.use(sharedSession(session, { autoSave:true}))

//  Socket.IO connection event
io.on("connection",(socket) => {
    console.log(`User ${socket.userId} connected`)


//   Broadcasting message to multiple client in a room
socket.join("room1");
socket.on("broadcast",(message) => {
    io.on("room1").emit("message",{userId:socket.userId,message});
})

//  Real time update from rest Api
setInterval(async () => {
    const users = await fetchDataFromDatabase();
    io.emit("userUpdate",users);
},5000);
});
})


.catch(error => console.log("Error connecting to the database:",error));


// Function to simulate fetching data from the database
async function fetchDataFromDatabase(){
    return new Promise(resolve => {
        setTimeout(() => {
            resolve({ exampleData: "some data"});
        },2000);
    })
}
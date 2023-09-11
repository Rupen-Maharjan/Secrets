// Load environment variables from a .env file
require("dotenv").config();

// Import required packages/modules
const express = require("express"); // Web application framework
const passport = require("passport"); // Authentication middleware
const mongoose = require("mongoose"); // MongoDB object modeling tool
const parser = require("body-parser"); // Parse incoming request bodies
const app = express(); // Create an instance of the Express app
const session = require("express-session"); // Session middleware for Express
const localStrat = require("passport-local"); // Local authentication strategy
const User = require("./models/user"); // Importing the User model for MongoDB
const flash=require("connect-flash")
const {isLogedIn}=require("./middleware")
const Secrets= require("./models/Secrets")


// Connect to the MongoDB database
mongoose.connect(`mongodb+srv://admin-rupen:${d2tIchih1T90sqEt}@cluster0.uxdlixw.mongodb.net/blogDB`, { useNewUrlParser: true })
.then(connected => {
    console.log("Connected to the DataBase");
})
.catch(err => {
    console.log(err);
});

// Set up middleware and configurations
app.use(parser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.set("view engine", "ejs"); // Set EJS as the view engine
app.use(flash())

// Configure session management
app.use(session({
    secret: process.env.SECRET, // Secret for session encryption (from .env)
    resave: false, // Don't save the session if unmodified
    saveUninitialized: false // Don't save a session that's uninitialized
}));

app.use(passport.initialize()); // Initialize Passport.js
app.use(passport.session()); // Use Passport session management

// Set up passport local strategy for authentication
passport.use(new localStrat(User.authenticate()));

// Serialize and deserialize user data to/from session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Define routes and corresponding handlers
app.route("/")
.get((req, res) => {
    res.render("home"); // Render the "home" view for the root URL
});

app.route("/secrets")
.get(isLogedIn,(req, res) => {
    const currentUsr = req.user
    Secrets.find({})
    .then(found =>{
        res.render("secrets",{message:req.flash('success'),usrSecret:found, currentUser:currentUsr}); // Render the "secrets" view for the "/secrets" URL
    })
});

app.route("/register")
.get((req, res) => {
    res.render("register",{errMsg:req.flash("userErr")}); // Render the "register" view for the "/register" URL
})
.post(async (req, res,next) => {
    try {
    const { email, username, password } = req.body;
    
        // Create a new User instance with provided data
        const newUser = new User({
            username,
            email
        });
    
        // Check if the user already exists
        const existingUser = await User.findOne({ username });
        
        if (existingUser) {
            req.flash("userErr",'Username already exists! Try logging in or use different username')
            res.redirect("/register")
        }
    
        // Check if the email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("userErr",'Email already exists! Try logging in or use different email')
            res.redirect("/register")
        }
    
        // Register the new user in the database
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser,err =>{
            if (err){
                return next(err);
            }
            else{
                req.flash("success","Registered successfully");
                res.redirect("/secrets"); // Redirect to the "secrets" page upon successful registration
            }
        })
    } catch (err) {
        switch (err.message) {
            case "User already exists":
                res.render("register", { error: "User already exists" });
                break;
            case "Email already exists":
                res.render("register", { error: "Email already exists" });
                break;
            default:
                console.log(err);
        }
    }
    });

app.route("/login")
.get((req, res) => {
    res.render("login",{msg:req.flash("noUser")}); // Render the "login" view for the "/login" URL
})

.post(passport.authenticate('local',{failureFlash:true,failureRedirect:"/login"}),(req,res)=>{
    req.flash("success","Welcome back")
    res.redirect("/secrets")
});

app.route("/submit")
.get(isLogedIn,(req,res)=>{
    res.render("submit")
})

.post((req,res)=>{
    const submittedScrt=req.body.secret;

    const newScrt= new Secrets({
        secret:submittedScrt,
        author:req.user.id,
        username:req.user.username
    })

    newScrt.save()
    .then(s=>{
        res.redirect("/secrets")
    })
    .catch(err=>{
        console.log(err)
    })
})

app.route("/logout")

.get((req,res)=>{
    req.logout(err=>{
        console.log(err)
    });
    res.redirect("/")
})

// Start the server on port 3000
app.listen(3000, () => {
    console.log("Listening on port 3000");
});

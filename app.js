//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser=require('body-parser');
var mongoose = require('mongoose');
const ejs=require('ejs');
const session = require('express-session');
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
const app = express();
app.use(express.static('public'));
app.set("view engine","ejs");
app.use(bodyParser.urlencoded({extended:true}));
const port = 3000;

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }));
  app.use(passport.initialize());
  app.use(passport.session());
var mongoDB = 'mongodb://localhost:27017/UserData';
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
//mongoose.set("useCreateIndex",true);
const userSchema=new mongoose.Schema({
    email:String,
    password:String
});

userSchema.plugin(passportLocalMongoose);
const User =mongoose.model("User",userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
var user="";
app.get('/', (req, res) => {
  res.render("home");
})

app.get('/register', (req, res) => {
    res.render("register");
  })
  
app.get('/login', (req, res) => {
    res.render("login");
  });
  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });
  app.get("/secrets",(req,res)=>{
     if(req.isAuthenticated())
     {
        res.render("secrets",{user:user});
     }
     else
     {
       res.redirect("/login"); 
     }
  });
  app.post('/register', (req, res) => {
    User.register({username:req.body.username},req.body.password,function(err,user)
    {
        if(err)
        {
           
        console.log(err);
        }
        else
        {
        passport.authenticate("local")(req,res,()=>{
            res.redirect("/secrets");
        })
        }
    }
    );
});
  app.post("/login",(req,res)=>
  {
user =new User(
    {
    username:req.body.username,
    password:req.body.password
    }
);
   req.login(user,(err)=>
   {
    if(err)
    {
    console.log(err);
    res.redirect("/register");
    }
    else
    {
        passport.authenticate("local")(req,res,(err)=>{
            if(err)
            {
            res.redirect("/login");
            }
            else
            {
            res.redirect("/secrets");
            }
    });
   }
   });
  });
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
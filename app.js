if (process.env.NODE_ENV!=='production') {
    require('dotenv').config()
}

const bodyParser=require("body-parser")
const express=require("express")
const server=express()
const {insert,user,find,insertBus,findBus,customerSearch}=require('./src/db/mongoose')
const bcrypt=require('bcryptjs')
const passport=require('passport')
const initializePassport=require('./pass')
const flash = require("express-flash")
const session=require('express-session')
const { render } = require('ejs')
const path=require('path')
// const ejsLint = require('ejs-lint');
const pass = require('./pass')
const { request } = require('express')
initializePassport(passport,user,insert,find)
server.use("/static",express.static('./static'))
port=process.env.PORT || 5050
server.set('view engine','ejs')
    server.use(express.urlencoded({extended:true}))
    server.use(flash())
    server.use(session({
        secret:'thesecret',
        resave:false,
        saveUninitialized:false
    }))
    server.use(bodyParser.json())
    server.use(bodyParser.urlencoded({extended:false}))
   
    
    server.use(passport.initialize())
    server.use(passport.session())
    


server.get("/",(req,res)=>{
    res.render('login')
})
server.get("/login",(req,res)=>{
    res.render('login')
})
server.get('/home',(req,res)=>{
    res.render("home") 
})
server.post('/login',passport.authenticate('local-signin',{
    successRedirect:"/verify",
    failureRedirect:"/login",
    failureFlash:true
}))
server.get('/signup',(req,res)=>{
    res.render("sign-up")    
})
server.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/verify',
    failureRedirect:'/signup',
    failureFlash:true
})
);
server.get('/logout',(req,res)=>{
    console.log(req.session)
    req.session.destroy(function(err){
        
        res.redirect('/');
    })
})
//-------------------------USER INTERFACES-----------------------
server.get("/verify",isLoggedIn,(req,res)=>{
    console.log("islogged in method in verify get method:",req.user);
    if (req.user.roll=="vendor") {
        res.redirect('/vendor')      
    } else {
        res.redirect('/customer')
    }
  
})
server.get("/vendor",(req,res)=>{
    console.log(req.user.fname)
    res.render("vendor",{
        name:req.user.fname,
        buses:"",
        message:"",
        
    })
})
server.get("/customer",(req,res)=>{
    console.log("req.session:::::::::",req.user)
    
   var  name=req.user.fname
    res.render("customer",{
        name,
        result:""
    })
})
server.post('/bus',async(request,response)=>{
    console.log("res.body from bus post method:",req.session);
    bus=req.body;
   var  email=req.session.passport.user.email
   await insertBus(email,bus.conditioner,bus.from,bus.to,bus.time,bus.seats)
    response.render('vendor', {
        buses:"",
        message: "bus saved successfully."
    })
})

server.get("/view",async(req,res)=>{
email=req.session.passport.user.email
const result=await findBus(email)   
console.log(result[2])
var temp;
for(i=0;i<result.length-1;i++){
    console.log("result["+i+"] :",result[i])
   

}
res.render("vendor",{
    buses:result,
    message:""
})
})
server.get("/search",async(req,res)=>{
    // console.log("bhai check krte hai::",req.query)
    bus=await customerSearch(req.query.from,req.query.to)
    // console.log("yaha result check krte hai::",bus)
    if (!bus) {
        res.render("customer",{
            name:req.session.passport.user.fname,
            result:"no bus available"
        })
    } else {
        res.render("customer",{
            name:req.session.passport.user.fname,
           result: bus[0]
        })
    }
   
})
server.get('/book',(req,res)=>{
    console.log(req.user)
    // res.send(req)    
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
     console.log("authenticated");
  return next();
};
   res.redirect('/login')
  }

server.get('/register_new_bus',(req,res)=>{
    res.render('register_bus',{
        message:""
    })
})


server.listen(port,()=>{
    console.log("Server is on port 5050")
})


//req.session.passport.user = {}
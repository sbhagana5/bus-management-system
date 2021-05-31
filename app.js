if (process.env.NODE_ENV!=='production') {
    require('dotenv').config()
}
const ensureLogin =require('connect-ensure-login')
const{ val }= require('./emailApi')
const bodyParser=require("body-parser")
const express=require("express")
const server=express()
const {insert,model,find,insertBus,findBus,customerSearch,insertAgency,findAgency,findBusWithId,insertDriver, searchDriver}=require('./src/db/mongoose')
const bcrypt=require('bcryptjs')
const passport=require('passport')
const initializePassport=require('./passport/pass')
const flash = require("express-flash")
const session=require('express-session')
const { render } = require('ejs')
const path=require('path')
const pass = require('./passport/pass')
const { request } = require('express')
const busDetails = require('./static/js/busDetails')
const { log } = require('console')
initializePassport(passport,model,insert,find,insertAgency,findAgency)
server.use("/static",express.static('./static'))

port=process.env.PORT 
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
    
//------------------AUTHENTICATION ROUTERS-------------------------

server.get("/",(req,res)=>{
    res.render('login')
})
server.get("/login",(req,res)=>{
    res.render('login')
})
server.get('/home',(req,res)=>{
    res.render("home",{
        name:req.session.passport.user.fname
    }) 
})
server.post('/login',passport.authenticate('Agency-signin',{
    successRedirect:"/verify",
    failureRedirect:"/login",
    failureFlash:true,
    failureMessage:"login failed"
}))
server.get('/signup_port',(req,res)=>{
    res.render("signup_port")    
})
server.get('/signup',(req,res)=>{
    res.render("sign-up")
})
server.post('/signup', passport.authenticate('local-signup',{
    successRedirect:'/check',
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
//------------------ Agency Interface--------------------------------////////////

server.get("/register_agency",(req,res)=>{
    res.render("signup_agency")
})
server.post("/register_agency", passport.authenticate('Agency-signup',{
    successRedirect:"/check",
    failureRedirect:"/register_agency",
    failureFlash:true
})
)
server.get('/agency',(req,res)=>{
    res.render('signin_agency')
})
server.post('/agency',passport.authenticate('Agency-signin',{
    successRedirect:"/verify",
    failureRedirect:"/login",
    failureFlash:true,
    failureMessage:"login failed"
}))
//-------------------------middleware-----------------------
server.get("/verify",isLoggedIn,(req,res)=>{
    if(req.user.roll=="customer") {
       return res.redirect('/customer')
    }
    else{
        res.redirect('/vendor')
    }
  
})
server.get("/check",isLoggedIn,(req,res)=>{
    const message=`<h2>You have successfully registered to <span class='text-primary'> RED BUS </span>.Use your email and password to login.`
    val(req.user.email,message)
    console.log("islogged in method in check get method:",req.user);
    if(req.user.roll=="customer") {
        return res.redirect('/customer')
     }
     else{
         res.redirect('/vendor')
     }
   
})

//------------user interface------------------- 
server.get("/vendor",ensureLogin.ensureLoggedIn('/login'),(req,res)=>{
    console.log(req.user.fname)
    res.render("vendor",{
        name:req.session.passport.user.Aname,
        buses:"",
        message:"",
        
    })
})
server.get("/customer",ensureLogin.ensureLoggedIn('/login'),(req,res)=>{
    console.log("req.session:::::::::",req.user)
    
   var  name=req.user.fname
    res.render("customer",{
        name,
        result:""
    })
})
//-----------------------showing bus details--------------------
server.get("/middleware/:id",ensureLogin.ensureLoggedIn('/login'),async(req,res)=>{
    try {
        const busId = req.params["id"]
        const drivers=await searchDriver(busId)
        req.session.drivers=drivers
        req.session.driverId=busId
        req.session.save()
        // console.log("req.session::",req.session.driverId)
        res.redirect("/view_bus")    
    } catch (error) {
        console.log(error)
    }
    
})
server.get("/view_bus",ensureLogin.ensureLoggedIn('/login'),async(req ,res)=>{
   try{
    const driverId=req.session.driverId
    const drivers= req.session.drivers
    console.log("driverID,",driverId)
    const result =await findBusWithId(driverId)
    res.render("your_bus.ejs",{
        id:driverId,
        name:req.session.passport.user.Aname,
        from:result.from,
        to:result.to,
        result:drivers
    })
   }catch(err){
console.log(err);
   }
   
})
///////---------------------- register bus--------------- /////////////////////////
server.post('/bus',ensureLogin.ensureLoggedIn('/login'),async(req,response)=>{
    try {
        bus=req.body;
        console.log("bus details:",bus)
       var  email=req.session.passport.user.email;
       await insertBus(email,bus.busNumber,bus.conditioner,bus.from,bus.to,bus.type)
      const message=`<h2>Your Bus has been successfully registered to <span class='text-primary'> RED BUS </span>.
      <h4>Bus Number:${bus.busNumber}</h4>
      <h4>A/C Type:${bus.conditioner}</h4>
      <h4>From:${bus.from}</h4>
      <h4>To:${bus.to}</h4>
      <h4>Bus Type:${bus.type}</h4>`
    
       val(email,message) 
       response.render('newBus', {
            name:req.session.passport.user.Aname,
            message: "bus saved successfully.",
           
            
        })    
    } catch (error) {
        console.log(error)
    }
    
})
////////////////-------------------- check user buses--------------------------------
server.get("/view",ensureLogin.ensureLoggedIn('/login'),async(req,res)=>{
try {
    email=req.session.passport.user.email
console.log("req.ses::",req.session.driver)
const result=await findBus(email)  

res.render("checkBus",{
    buses:result,
    message:"",
    name:req.session.passport.user.Aname
})
} catch (error) {
    console.log(error)
}
})


///////------------------ customer seach bus-----------------------
server.get("/search",ensureLogin.ensureLoggedIn('/login'),async(req,res)=>{
    // console.log("bhai check krte hai::",req.query)
try {
    bus=await customerSearch(req.query.from,req.query.to)
    // console.log("yaha result check krte hai::",bus) 
        res.render("customer",{
            name:req.session.passport.user.fname,
           result:""
        })
   
} catch (error) {
    console.log(error)
}
   
})
//////-----------------register bus interface handller
server.get("/register_bus",ensureLogin.ensureLoggedIn('/login'),(req,res)=>{
    res.render("newBus",{
        name:req.session.passport.user.fname,
        message:"",
        
    })
})
////////////-------------------register driver------------------
server.get("/register_driver",ensureLogin.ensureLoggedIn('/login'),(req,res)=>{
    
    res.render("register_driver",{
        name:req.session.passport.user.Aname,
        id:req.session.driverId
    })
})
server.post("/submit/:id",ensureLogin.ensureLoggedIn('/login'),async(req,res)=>{
    try {
        
    const id = req.params["id"]
    console.log("submit id",id)
    const detail = req.body
console.log("driver details to insert::",detail)
const driver =await insertDriver(id,detail)
const message= `<h2>You have successfully registered to <span class='text-primary'> RED BUS . you serial id is ${driver.sr_number} `
val(driver.email,message)
console.log("driver",driver);
const bus =await findBusWithId(id)
const result =await searchDriver(id)
console.log("result::",result)
    if (driver) {
        res.redirect(`/middleware/${id}`)
    } else {
        res.send("error")
    }


    } catch (error) {
        console.log(error)
    }
})



///////////////////
function   isLoggedIn(req, res, next) {
    console.log('requesting :',req.body)
    if (req.isAuthenticated()) {
     console.log("authenticated");
  return next();
}else{
    console.log("authentication error.")
    res.redirect('/login')
}

   
  }
server.listen(port,()=>{
    console.log("Server is on port ",port)
})


//req.session.passport.user = {}
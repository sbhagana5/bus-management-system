const bcrypt=require("bcryptjs");
const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/redBusDb',{
    useNewUrlParser:true,
    useCreateIndex:true
},(err,res)=>{
    if (err) {
        console.log(err);
    } else {
        console.log("Connected");
    }
})
const User=mongoose.model('User')
const agency =mongoose.model('Agency')
module.exports=function (passport,model,insert,find,insertAgency,findAgency) {
 let mod;
    var localStrategy=require("passport-local").Strategy;

    passport.serializeUser(function(user, done) {
        console.log("seraialize:",user);
        done(null, user);
      });
      
      passport.deserializeUser(function(id, done) {
          console.log("Deserialize:",id);
          mod.findById(id, function(err, user) {
            done(err, user);
        });
           
    
      });
      //local-signup
      passport.use(
        "local-signup",
        new localStrategy({
            usernameField:"email",
            passwordField:"password",
            passReqToCallback:true // allows us to pass back the entire request to the callback
        },
         async(req,email,password,done)=> {
            var generateHash= async(password)=> {
                const salt=await bcrypt.genSalt(8)
                return await bcrypt.hash(password, salt);
            }
            const agency =await findAgency(email)
                const user=await find(email)
                    
                if (agency) {
                    return done(null,false,
                        {message:"agency already exist with this email"})
                } else if(user){
                        return done(null,false,
                            {message:"agency already exist with this email"})
                        }
                    if (!(password===req.body.pass)) {
                        return done(null,false,{message:"password doesnt match."})
                    } 
                var hashPass=await generateHash(password)
                var userData={
                                fname:req.body.fname,
                                lname:req.body.Lname,
                                email: req.body.email,
                                password: hashPass,
                                roll:req.body.roll
                        
                            }
                           const use = insert(userData.fname,userData.lname,userData.email,userData.password,userData.roll);
                          
                          mod=model.user;
                           return done(null,use)
            }
        
        )
      )

      //local-signin
      passport.use('local-signin',new localStrategy({
          usernameField:"email",
          passwordField:"password",
          passReqToCallback:true
      },
      async(req,email,password,done)=>{
          var isValidPassword=function(userPass,password){
            // console.log("userpass",userPass);
            // console.log("password",password);
              return bcrypt.compareSync(password,userPass);
          };

           const user=await find(email)
          if (!user) {
              return done(null,false,{
                  message:"Email doesnt exist."
              });
          }
          if (!isValidPassword(user.password,password)) {
              return done(null,false,{
                  message:"incorrect password."
              })
          }
          mod=model.user
          return done(null,user);
      }
      ))
      //agency-signup
      passport.use(
        'Agency-signup',new localStrategy({
            usernameField:"email",
            passwordField:"password",
            passReqToCallback:true
        },async(req,email,password,done)=>{
            const generateHash =async(password)=>{
                var genSalt = await bcrypt.genSalt(8)
                return  await bcrypt.hash(password,genSalt)  
            }
                const agency =await findAgency(email)
                const user=await find(email)
                    
                if (agency) {
                    return done(null,false,
                        {message:"agency already exist with this email"})
                } else if(user){
                        return done(null,false,
                            {message:"agency already exist with this email"})
                        }
                    if (!(password===req.body.pass)) {
                        return done(null,false,{message:"password doesnt match."})
                    }   
                    const hashPass=await generateHash(password)
                    const data =req.body
                    console.log("req.body in pass.js",data)
                    //-------date----------

                    const date =new Date();
                    const day= date.getDate();
                    const month = date.getMonth()+1
                    const year = date.getFullYear();
                    createdAt = `${day}-${month}-${year}`
                    currently='active'
                    const use = insertAgency(email,data.Aname,data.Oname,data.contact,createdAt,data.modifyAt,currently,hashPass)
                   console.log("user is saved..")
                   mod=model.agency;
                   console.log("use after insertion::::",use)
                    return done(null,use)
                }
            
        )
    )
     //------------Agency-Signin
     passport.use('Agency-signin',new localStrategy({
         usernameField:"email",
         passwordField:"password",
         passReqToCallback:true
     },async(req,email,password,done)=>{

         var isValidPassword = (userpass,password)=>{
            return bcrypt.compareSync(password,userpass)
         }
         
         const agency = await findAgency(email)
         const user=await find(email)
         if(agency){
            if (!isValidPassword(agency.password,password)) 
            {
                return done(null,false,{message:"password doesnt match"})
            }
            mod = model.agency
            return done(null,agency)
            }else if(user){
                if (!isValidPassword(user.password,password)) {
                    return done(null,false,{
                        message:"incorrect password."
                    })
                   
            }
            mod=model.user
            return done(null,user);
     }else{
         return done(null,false,{message:"email doesnt exist."})
     }
    }
     ))
    }





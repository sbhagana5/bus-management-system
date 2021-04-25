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
console.log('user::::',User);
module.exports=function (passport,model,insert,find) {
 
    var localStrategy=require("passport-local").Strategy;

    passport.serializeUser(function(user, done) {
        console.log("seraialize:",user);
        done(null, user);
      });
      
      passport.deserializeUser(function(id, done) {
          console.log("Deserialize:",id);
         
            User.findById(id, function(err, user) {
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
             console.log("after async function in pass.js",req.body);
            var generateHash= async(password)=> {
                const salt=await bcrypt.genSalt(8)
                return await bcrypt.hash(password, salt);
            }
            const user=await find(email)
            if (user) {
                
                return done(null,false,{
                   message:'email is already taken.'
               })
            } else {
                if (!(password===req.body.pass)) {

                    return done(null,false,{message:'password doesnt match'})
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
                           return done(null,use)
            }
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
          return done(null,user);
      }
      ))
}




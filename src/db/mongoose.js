const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/redBusDb',{
    useNewUrlParser:true,
    useCreateIndex:true
})
const user=mongoose.model("User",{
    fname:{
        type:String
    },
    lname:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    roll:{
        type:String
    }
})
const bus=mongoose.model("Bus",{
    email:{
        type:String
    },
    conditioner:{
        type:String
    },
    from:{
        type:String
    },
    to:{
        type:String
    },
    time:{
        type:Date
    },
    seats:{
        type:Number
    }

})
const insert=(fname,lname,email,password,roll)=>{
    const me =new user({
        fname,
        lname,
        email,
        password,
        roll
    })
    let use;

    me.save().then(use=me).catch((Error)=>{
        console.log("error",Error)
    })  
    return use;
}
const insertBus=(email,conditioner,from,to,time,seats)=>{
    const me=new bus({
        email,
        conditioner,
        from,
        to,
        time,
        seats

    })

    me.save().then(console.log("bus saved successfully")).catch((err)=>{
        console.log("errror",err);
    });
}
const find= (email)=>{
    return user.findOne({email},(err,res)=>{
        if (err) {
            return console.log(err);
        } else {
            console.log("res.body::::::::::::::::",res) ;
            return res;
        }
    })
 }
 const findBus=(email)=>{
     return bus.find({email},(err,result)=>{
         if (err) {
             return console.log(err)
         }
         else {
             return result;
         }
     })
 }
 const customerSearch=async(from ,to)=>{
     console.log("from:",from)
     console.log("to:",to)
   return  await bus.find({from,to},(err,result)=>{
         if (err) {
             return console.log(err)
         } else {
             console.log("result:::",result)
             return result
         }
     })
 }
module.exports={user,insert,find,insertBus,findBus,customerSearch}
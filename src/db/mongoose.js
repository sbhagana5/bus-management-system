const mongoose=require('mongoose')
mongoose.connect(process.env.MONGODB_URL,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useUnifiedTopology: true
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
    busNumber:{
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
    type:{
        type:String
    },

})  
const agency = mongoose.model("Agency",{
    email:{
        type:String
    },
    Aname:{
        type:String
    },
    Oname:{
        type:String
    },
    contact:{
        type:Number
    },
    createdAt:{
        type:String
    },
    modifyAt:{
        type:String
    },
    currently:{
        type:String
    },
    password:{
        type:String
    }
})
const driver =mongoose.model("Driver",{
    sr_number:{
        type:Number
    },
    busId:{
        type:String
    },
    lname:{
        type:String
    },
    fname:{
        type:String
    },
    contact:{
        type:Number
    },
    email:{
        type:String
    },
    birthDate:{
        type:String
    },
    position:{
        type:String
    }
})
const insert=(fname,lname,email,password,roll)=>{
    const me =new user({
        fname,
        lname,
        email,
        password,
        roll:'customer'
    })
    let use;

    me.save().then(use=me).catch((Error)=>{
        console.log("error",Error)
    })  
    return use;
}
const insertBus=(email,busNumber,conditioner,from,to,type)=>{
    const me=new bus({
        email,
        busNumber,
        conditioner,
        from,
        to,
        type

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
 const findBusWithId=(id)=>{

    return   bus.findById(id,(err,result)=>{
        if (err) {
            return console.log(err)
        }
        else {
            // console.log("result in busId",result)
            return result;
        }
    })
 }
 const customerSearch=async(from ,to)=>{
     
   return  await bus.find({from,to},(err,result)=>{
         if (err) {
             return console.log(err)
         } else {
             return result
         }
     })
 }
 const insertAgency = (email,Aname,Oname,contact,createdAt,modifyDate,currently,password)=>{
     const me =new agency({
        email,Aname,Oname,contact,createdAt,modifyDate,currently,password
     })
     let use;
     me.save().then(use=me).catch((err)=>{
        console.log("error:::",err)
     })
     return use;
 }
const findAgency =(email)=>{
    return agency.findOne({email},(err,res)=>{
        if (err) {
            return console.log(err);
        } else {
            return res;
        }
    })
}
const insertDriver =async(busId,detail)=>{
    const result=await driver.find({busId})
    console.log("result length::",result.length)
    const count= result.length+1001
const me = new driver({
    sr_number:count,
    busId,
    lname:detail.lname,
    fname:detail.fname,
    contact:detail.contact,
    email:detail.email,
    birthDate:detail.birthDate,
    position:detail.position

})
let use
me.save().then(use=me).catch((err)=>{
    console.log("error",err)
})
return use;
}
const searchDriver=async (busId)=>{
    return  await driver.find({busId},(err,res)=>{
        if (err) {
            return err
        } else {
            return res
        }
    })

}
const model= {
    user,
    agency,
    bus
}
module.exports={model,insert,find,insertBus,findBus,customerSearch,insertAgency,findAgency,findBusWithId,insertDriver,searchDriver}


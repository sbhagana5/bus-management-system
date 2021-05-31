const {google} = require("googleapis");
const nodemailer = require("nodemailer")
const { OAuth2Client } = require('google-auth-library');

const client_id=process.env.client_id
const client_secret=process.env.client_secret
const  redirect_uri = process.env.redirect_uri
const refresh_token =process.env.refresh_token

const oauth2client =new OAuth2Client(client_id,client_secret,redirect_uri)
oauth2client.setCredentials({refresh_token:refresh_token})

async function sendmail(gmail,message){
    const accessToken =await  oauth2client.getAccessToken()
    const transport = nodemailer.createTransport({
        service:'gmail',
        auth:{
            type:'OAuth2',
            user:'sbhagana5@gmail.com',
            clientId:client_id,
            clientSecret:client_secret,
            refreshToken:refresh_token,
            accessToken:accessToken
        }
    }) 
const mailOption={
    from:'SK <sbhagana@gmail.com>',
    to:gmail,
    subject:'REGISTRATION SUCCESSFUL',
    text:"hello>............ ",
    html:message
}
const result =await transport.sendMail(mailOption)
return result
}
const val = (email,message)=>{
   return sendmail(email,message).then(result=>console.log("email sent0",result)).catch((error)=>console.log("Error",error.message))

}
module.exports={ val }
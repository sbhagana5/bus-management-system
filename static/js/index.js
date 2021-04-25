

document.querySelector(".submit").addEventListener("click",function () {

alert("bus has been saved successfully.")    
})





var template=document.querySelector("#saved").innerHTML

var data={
    message:"hello"
}
Mustache.render(template,data)
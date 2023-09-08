const express=require('express');
const app=express();
const mongoose=require('mongoose');
const Product=require('./productModel');
var bodyParser = require('body-parser');
var cors = require('cors')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

const seedDB=async()=>{
    //Seeding the database with the data from API.
    const data= await fetch('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
 const allProducts= await data.json()

    await Product.deleteMany({});
    await Product.insertMany(allProducts);
    
}
seedDB().then(()=>{
    console.log('Data inserted')
})
.catch(err=>{
    console.log(err);
})

app.get('/search/:token/:pageNo/:month',async(req,res)=>{
    console.log(req.params.token)
    console.log(req.params.month)
   if(req.params.token.trim().length!=0) //Checking for an empty string or blank spaces
   {
    Product.find({$and:[{$text:{$search:req.params.token}},{$expr:{$eq:[{$month:'$dateOfSale'},req.params.month]}}]}).skip((req.params.pageNo-1)*10).limit(10).then((data)=>{res.send(data)})
    .catch(err=>{console.log(err)})
    
   }
   else
   {
    Product.find({$expr:{$eq:[{$month:'$dateOfSale'},req.params.month]}}).skip((req.params.pageNo-1)*10).limit(10).then((data)=>{res.send(data)})
    .catch(err=>{console.log(err)})
    
   }
    
})
app.get('/monthData/:month',async(req,res)=>{
 console.log(req.params.month)
 var d=parseInt(req.params.month);//converting from string to int
      Product.aggregate([{$project:{month:{$month:'$dateOfSale'},price:1,sold:1}},{$match:{month:d}},{$group:{_id:'$sold',total:{$sum:'$price'},count:{$sum:1}}}]).then((data)=>{
        console.log(data)
        var sold; //initializing variables to collect data
        var unsold;
     var total=0;
     data.forEach(a=>{ //finding total and count of sold & unsold items.
        (a._id?sold=a.count:unsold=a.count)
        total=total+a.total;
     })
     res.send([{total:total,sold:sold,unsold:unsold}])
      })
      .catch(err=>{console.log(err)})
 
})

app.get('/monthGraph/:month',(req,res)=>{
    var d=parseInt(req.params.month) //converting data type
    Product.aggregate([{$project:{month:{$month:'$dateOfSale'},price:1}},{$match:{month:d}},{$bucket:{groupBy:'$price',boundaries:[0,100,200,300,400,500,600,700,800,900],default:901,output:{'count':{$sum:1}}}}])
    .then((data)=>{
        res.send(data);
console.log(data);        
        })
        .catch(err=>{console.log(err)})
    })

app.get('/pieGraph/:month',(req,res)=>{
    var month=parseInt(req.params.month)
Product.aggregate([{$project:{month:{$month:'$dateOfSale'},category:1}},{$match:{month:month}},{$group:{_id:'$category',count:{$sum:1}}}])
.then((data)=>{
    console.log(data)
    res.send(data)
})
.catch(err=>{
    console.log(err)
})
})

app.get('/fetchAll/:month',async(req,res)=>{

    const fetchAll=async()=>{
    const month=req.params.month;
    var res=await fetch('http://localhost:2100/monthData/'+month)
    const monthData= await res.json()
    res= await fetch('http://localhost:2100/monthGraph/'+month)
    const monthGraph=await res.json()
    res= await fetch('http://localhost:2100/pieGraph/'+month)
    const pieGraph=await res.json()
    const fetchedAll=[...monthData,...monthGraph,...pieGraph] //concatenating all previous results

    return fetchedAll;
}
fetchAll().then((data)=>{
    console.log(data)
    res.send(data)
})
.catch(err=>console.log(err))

})
app.listen(2100,()=>{console.log('running at port 2100')})
const mongoose = require("mongoose");
var url="mongodb://127.0.0.1:27017/grass";  
mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
const Schema = mongoose.Schema;
const productSchema = new Schema({
    id:{
        type:Number,
        required:true
    },
    title: {
        type:String,
        required:true
    },
    price: {
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    category:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    sold:{
        type:Boolean,
        required:true
    },
dateOfSale:{
    type:Date,
    
}
    
  })
  productSchema.index({title:'text',description:'text',category:'text'});
  var productModel = mongoose.model("User",productSchema);
  module.exports = productModel;
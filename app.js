require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');
const ejs = require('ejs');
var _ = require('lodash');

const startingContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const about = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
const contact = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

const app = express();

const uri = "mongodb+srv://admin:"+ process.env.PASSWORD +"@cluster0.fs7mb.mongodb.net/BlogDatabase?retryWrites=true&w=majority";
const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true
    };
mongoose.connect(uri, options).then(() => {
      console.log("Database connection established!");
    }, err => {
    {
        console.log("Error connecting Database instance due to:", err);
    }
});

const blogSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    date:{
        type:String,
        required:true
    },
    content:{
        type:String,
        required:true
    }
});

const Blog = new mongoose.model("Blog", blogSchema);

const itemSchema = new mongoose.Schema({
    listitem:{
        type:String,
        required:true
    }
});

const Item = new mongoose.model('item',itemSchema);

app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/',(req,res)=>{
    Blog.find((err,Blogs)=>{
        if(err){
            console.log(err);
        }else {                        
            res.render('home',{intro:startingContent,posts:Blogs,page_name:'home'});
        }
     });    
});

app.get('/contact',(req,res)=>{
    res.render('contact',{page_name:'contact',info:contact});
}); 

app.get('/todo',(req,res)=>{
    Item.find((err,items)=>{
        if(err){
            console.log(err);
        }else{
            res.render('todo',{page_name:'todo',list:items});
        }
    })
});

app.post('/todo',async(req,res)=>{
    let newitem = req.body.newItem;
    let i = new Item({
        listitem: newitem
    });
    await i.save();    
    res.redirect('/todo');
});

app.post('/deleteItem',async(req,res)=>{
    // let name = req.body.
    console.log(req.body.checkbox);
    await Item.deleteOne({_id: req.body.checkbox});
    res.redirect('/todo');
});

app.get('/compose',(req,res)=>{
    res.render('compose',{page_name:'compose'});
});

app.post('/compose',(req,res)=>{
    const date = new Date();
    const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];    
    // const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    let month = months[date.getMonth()];
    let day = date.getDate();
    let year = date.getFullYear();
    const b = new Blog({
        title: _.upperCase(req.body.title),
        date: day+", "+month+", "+year,
        content: req.body.info
    }); 
    b.save();
    res.redirect('/compose');
});

app.get('/posts/:title',(req,res)=>{
    var searched = _.upperCase(req.params.title);
    Blog.findOne({title:searched},(err,found)=>{
        if(err){
            console.log('Not found');
        }else{
            console.log(found);
            res.render('post',{page_name:'posts',post:found});
        }
    })    
});

app.use(express.static("public"));

let port = process.env.PORT || 3000;

app.listen(port,()=>{
    console.log('Successfully connected');
});
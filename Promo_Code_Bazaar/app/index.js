var express = require('express');
const { json } = require('express/lib/response');
var fs = require('fs');

var app = express();
var used_IDs = [];
app.use(express.static('../contract/build/contracts'));
app.use(express.static('src'));
app.use(express.json());
app.use(express.urlencoded());

app.get('/', function (req, res) {
  res.render('index.html');``
});

app.get('/loadItems', function(req, res){
  file = fs.readFileSync('items.json');
  json_data = JSON.parse(file);
  res.json(json_data);
});

app.get('/getTxs', function(req, res){
  file = fs.readFileSync('transactions.json');
  json_data = JSON.parse(file);
  res.json(json_data);
});

app.get('/getRatings', function(req, res){
  file = fs.readFileSync('ratings.json');
  json_data = JSON.parse(file);
  res.json(json_data);
});

app.post('/addRating', function(req, res){
  //console.log(req.body);
  let data = Object.keys(req.body)[0];
  let file = fs.readFileSync('ratings.json');
  let json_data = JSON.parse(file);
  //console.log(file);
  //console.log(data);
  if(data.id in used_IDs){
    return;
  }
  if (data.seller in json_data){
    json_data[JSON.parse(data).seller].push(parseInt(JSON.parse(data).rating));
  }
  else{
    json_data[JSON.parse(data).seller] = [parseInt(JSON.parse(data).rating)];
  }
  fs.writeFile("ratings.json", JSON.stringify(json_data), (err) => { 
    if (err) { 
      console.log(err); 
    }
    else{
      //console.log(JSON.stringify("AFTER ADDED ITEM" + json_data));
    } 
  }); 

});

app.post('/addItem', function(req, res) {
  //console.log(req.body);
  let data = Object.keys(req.body)[0];
  //console.log("REGULAR DATA " + data);
  file = fs.readFileSync('items.json');
  json_data = JSON.parse(file);
  json_data.push(JSON.parse(data));
  //console.log("JSON DATA " + json_data);
  fs.writeFile("items.json", JSON.stringify(json_data), (err) => { 
    if (err) { 
      console.log(err); 
    }
    else{
      //console.log(JSON.stringify("AFTER ADDED ITEM" + json_data));
    } 
  }); 
});

app.post('/buyItem', function(req, res){
  data = JSON.parse(Object.keys(req.body)[0]);
  //console.log("BOUGHT ITEM "+ data);
  file = fs.readFileSync('items.json');
  json_data = JSON.parse(file);
  for(let i=0; i < json_data.length; i++){  // alters selected item sold value to true
    if(data.id == json_data[i].id){
      json_data[i].sold = true;
      //console.log(json_data[i].sold);
    }
  }
  fs.writeFile("items.json", JSON.stringify(json_data), (err) => { 
    if (err) { 
      console.log(err); 
    }
    else{
      //console.log(JSON.stringify("UPDATED AFTER BOUGHT " + json_data));
    } 
  }); 
  //fs.writeFile("transactions.json", JSON.stringify{})
});

app.post('/updateTxs', function(req, res){
  data = Object.keys(req.body)[0];
  console.log("TRANSACTION " + data);
  file = fs.readFileSync('transactions.json');
  json_data = JSON.parse(file);
  json_data.push(JSON.parse(data));
  fs.writeFile("transactions.json", JSON.stringify(json_data), (err) => { 
    if (err) { 
      console.log(err); 
    }
    else{
      //console.log(JSON.stringify("TRANSACTION " + json_data));
    } 
  }); 
});

app.post('/addRating', function(req, res) {
  console.log("hi");
});

app.listen(3000, function () {
  fs.writeFile("items.json", JSON.stringify([]), (err) => { 
    if (err) { 
      console.log(err); 
    } 
  }); 
  fs.writeFile("transactions.json", JSON.stringify([]), (err) => { 
    if (err) { 
      console.log(err); 
    } 
  }); 
  fs.writeFile("ratings.json", JSON.stringify({}), (err) => { 
    if (err) { 
      console.log(err); 
    } 
  }); 
  console.log('Example app listening on port 3000!');
});
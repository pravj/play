/**
 * Module dependencies.
 */

var express = require('express')
  , config = require('./dbconfig.js')
  , mysql = require('mysql')
  , routes = require('./routes');
// var WebSocketServer = require('websocket').server;

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

// DB connection

var dbconnect = mysql.createConnection({
  host: config.db_host,
  user: config.db_user,
  database: config.db_name,
  password: config.db_pass
});

dbconnect.connect(function (error) {
  if (error) {
    console.log(error);
  }
});


// Routes

app.get('/', routes.index);
//app.get('/playing',function(req,res){
//	res.sendfile("public/nowplaying.html");
//});
app.get('/current',routes.current);
//app.get('/pause',routes.pause);
app.get('/kill',routes.kill);
app.get('/queue',routes.queuelist);
app.get('/list',routes.list);
app.post('/play',routes.play);
app.post('/youtube',routes.youtube);
app.post('/log',function(req,res){
  var song = req.body.track;
  console.log(song);
  var sql = 'INSERT INTO list (' 
              +'trackId,'
              +'song,'
              +'artist,'
              +'picId,'
              +'count'
              +') VALUES ';
  sql += '(' 
          +req.body.id+','
          + "\"" + req.body.track + "\"" + ','
          + "\"" + req.body.artist + "\"" + ','
          +req.body.picId+','
          +1
          +')';
  dbconnect.query("SELECT * FROM list WHERE trackId = "+req.body.id,function(err,rows){
      // console.log("Request Count: " + ++requestcount);
      if (err)
      {
          console.log("error4: " + err);
      } else if (rows[0])
      {
          var songcount = rows[0].count;
          songcount+=1;
          dbconnect.query("UPDATE list SET count = " + songcount + " WHERE trackId = " +req.body.id,function(err5){
              if(err5) console.log("err5: " + err5);
              else ("Count Updated");
          });
      }
      else if(!rows[0])
      {
          dbconnect.query(sql,function(err1)
              {
                  if (err1)
                          console.log("Insert err: " + err1);
              });
      }
  })
  res.send("beach");
});
app.post('/mostplayed',function(req,res){
  // res.sendfile("mostplayed.html");
  dbconnect.query("SELECT * FROM list ORDER BY count DESC ",function(err,rows){
      if (err)
      {
          console.log("error3: " + err);
      } else
      {
          var jsonObj = JSON.stringify(rows);
          res.send(jsonObj);
      }
  })
});

app.listen(3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
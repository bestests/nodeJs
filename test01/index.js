const express = require('express');
const app     = express();
const server  = require('http').Server(app);
const io      = require('socket.io')(server);

var cnt = 0;
var idx = 0;
var isFirst = true;
var userObj = [];

app.use('/js', express.static(__dirname + '/js/'));

server.listen(2222, function () {
   console.log('port 2222 on!!!');
});

app.get('/', function (req, res) {
   res.sendFile(__dirname + '/html/index.html');
});

io.on('connection', function (socket) {

   socket.userObj = userObj;

   socket.emit('on', { cnt: cnt, idx: idx });
   socket.userObj[idx]     = new Object();
   socket.userObj[idx].idx = idx;
   socket.userObj[idx].id  = idx;
   socket.idx              = idx;

   console.log("=====connect=====");
   console.log(socket.userObj[idx]);
   console.log("=====connect=====");
   idx++;
   cnt++;

   socket.on('connect event', function (data) {
      io.emit('totalCnt change', { cnt: cnt });
   });

   socket.on('check Id', function (data) {
      
      var result = true;
      for(var i = 0 ; i < socket.userObj.length ; i++) {

         if(socket.userObj[i]) {
            var id = socket.userObj[i].id;

            if(id) {
               var newId = data.newId;

               if(id === newId) result = false;
            }
         }
      }

      socket.emit('check Id result', { result: result });
   });

   socket.on('change Id', function (data) {
      var idx  = data.idx;
      var id   = data.id;
      var exId = socket.userObj[idx].id;

      socket.userObj[idx].id = id;

      io.emit('service message', { message: "'" + exId  + "' -> '" + id + "' Changed ID" });
      socket.emit('chaged Id', {idx: idx, id: id});
   });

   socket.on('input text', function (data) {
      socket.broadcast.emit('input message', { msg: data.id + " is typing..." });
   });

   socket.on("enter text", function (data) {
      socket.broadcast.emit('text message', { idx: data.idx, id: data.id, msg: data.msg });
   });

   socket.on('disconnect', function () {
      var leftIdx = socket.idx;
      var leftId  = socket.userObj[leftIdx].id;
      cnt--;
      io.emit('service message', { message: leftId + " has left." });
      io.emit('totalCnt change', { cnt: cnt });

      socket.userObj[leftIdx] = null;

      console.log("=====disconnect=====");
      console.log("leftIdx : " + leftIdx + ", leftId : " + leftId);
      console.log("now use cnt : " + cnt);
      console.log("=====disconnect=====");
   });
});

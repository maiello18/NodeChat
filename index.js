var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var conversation = [];

//routes
app.use('/', express.static(__dirname));
//app.use(express.static(__dirname + '/public'));

app.use(require('serve-favicon')(__dirname + '/public/favicon.ico'));

//initial landing page
app.get('/', function(req, res){
  res.sendFile(__dirname + '/landingpage.html');
});


//socket io code 
io.on('connection', function(socket){
  //user leaves the chatroom
  socket.on('disconnect', function(){
    // does not equal null for the edge case where the server quits and then someone reloads upon server turning on
    if(socket.username != null){      
      //sign out message for conversation array as well as to be emitted out
      var signOutMessage = '🔴 <i>' + socket.username + ' left the chat...</i>';
      
      //add to array
      //conversation.push(signOutMessage);

      //send to every client
      io.emit('is_online', signOutMessage);

    }
  });

  //user signs into the chatroom with user name 
  socket.on('user_sign_in', function(username){
    //save the username
    socket.username = username;

    //sign in message
    var signInMessage = '🔵 <i>' + socket.username + ' joined the chat...</i>';

    //add message to conversation array
    //conversation.push(signInMessage);

    //send to every client
    io.emit('is_online', signInMessage);

    //send the conversation to the client that just signed on
    if(conversation.length != 0){
      conversation.forEach(singleChat => {
        socket.emit('chat_message', singleChat);
      });
    }
  });

  //user sends a message
  socket.on('chat_message', function(message){
    var msg = '<strong>' + socket.username + '</strong>: ' + message;
    conversation.push(msg);
    io.emit('chat_message', msg);
  });

  //tells everyone but typer, that typer is typing
  socket.on('is_typing', function(username){
    socket.broadcast.emit('is_typing', '<strong>' + username + ' is typing...</strong>');
  });

  //tells everyone but typer, that typer is not typing..goes to client side function 
  //that removes them (is typing messages) from message list
  socket.on('no_longer_typing', function(username){
    socket.broadcast.emit('no_longer_typing', '<strong>' + username + ' is no longer typing...</strong>');
  });

});

//start server
server.listen(3000);
console.log('listening on 3000');

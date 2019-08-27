var socket = io(); //used for communication and sending out content
var username; 
var typing = false;
var timeout = undefined; 

$(function(){
  
  //the message box, where user presses send to send chat
  $('#messages_form').submit(function(e){
    e.preventDefault(); // prevents page reloading
    socket.emit('chat_message', $('#messages_input').val());
    $('#messages_input').val('');
    return false;
  });

  //when a message comes in, append it to the chatbox
  socket.on('chat_message', function(msg){
    $('#messages').append($('<li>').html(msg));
    
    //  var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    //var messagesHeight = $("#messages")[0].scrollHeight;
    //console.log('messagesHeight: ' + messagesHeight);
    //console.log('scrollTop: ' + scrollTop);

    window.scrollTo(0,document.body.scrollHeight);
    
  });

  // append text if someone is online
  socket.on('is_online', function(message) {
    $('#messages').append($('<li>').html(message));
  });

  // append text if someone is typing
  socket.on('is_typing', function(username) {
    $('#messages').append($('<li>').html(username));
  });

  // remove the "is typing" text from the messages ul
  socket.on('no_longer_typing', function(username) {
    //Here is where we should remove the elements...FINAL
    var i = 0; 
    var ul = document.getElementById("messages");
    var items = ul.getElementsByTagName("li");

    for(i; i < items.length; i++){
      if(items[i].textContent.includes("typing")){
        var liToRemove = ul.childNodes[i];
        liToRemove.parentNode.removeChild(liToRemove);
      }
    }
  });

  // Get the modal
  var modal = document.getElementById("myModal");

  // Get the button that opens the modal
  var btn = document.getElementById("myBtn");

  // When the user clicks on the button, open the modal 
  btn.onclick = function() {
    modal.style.display = "block";
  }

  //the username form, where users enter their username
  $('#join_button').click(function(e){
    e.preventDefault(); // prevents page reloading

    //check for empty form info
    if($('#username_input').val() == ''){
      alert("Please enter a username");
    }
    //if its not empty proceed to the chatroom.html 
    else{
      //get the username info from input form
      username = $('#username_input').val();
      
      //emit the message that this client signed in
      socket.emit('user_sign_in', $('#username_input').val());

      //clear input field
      $('#username_input').val('');

      //hide the sign in prompt
      modal.style.display = "none";

      //scroll to the bottom of the page upon signing in
      window.scrollTo(0,document.body.scrollHeight);
    }

  });
});

//resets the typing boolean value to false
function timeoutFunction(){
  typing = false;
  socket.emit('no_longer_typing', username);
} 

//check if user is typing message..function of input field event attribute
function isTyping(){
  if(!typing){
    typing = true;
    socket.emit('is_typing', username);
    timeout = setTimeout(timeoutFunction, 1500);
  }
  else{
    clearTimeout(timeout); 
    timeout = setTimeout(timeoutFunction, 1500);
  }
}

$(window).load(function() {
  // page is fully loaded, including all frames, objects and images
  document.getElementById('myBtn').click();
});
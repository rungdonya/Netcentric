var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

playerName=[]; c=0;
var client = {user: "", score:0, start:0};
var num=[5], sum, number ="", quest = "", temp;


app.use(express.static(__dirname + '/'));

app.get('/',function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

var roomno=1;
io.sockets.on('connection',function (socket) {

    socket.on('send username',function (data, callback) {   //receive user name -> check duplicate
        console.log(data + " is connecting");
        if(playerName.indexOf(data)!=-1) {
            callback(false);
        }else{
            callback(true);
            socket.name = data;  //push name[]
            playerName.push(socket.name);

            socket.emit('welcomeuser',"Welcome "+data);
            io.sockets.emit('listOfUser',playerName);  //update
            socket.broadcast.emit('broadcast',socket.name +' has joined the chat');
            io.sockets.emit('broadcast', 'there are '+playerName.length+' users online');
            console.log('# of users online : '+playerName.length);
            client.user = socket.name; //keep name of client in server
        }

    });

   // socket.broadcast.emit('broadcast',playerName +' has joined the chat');

    socket.on('send msg',function (data) {
        console.log(socket.name + " : "+ data);
        io.sockets.emit('new msg',{msg:data, nick: socket.name});
    });
    send();
    clients = [];
    socket.on('pair',function () {
        socket.broadcast.emit('broadcast',socket.name +' is looking for an opponent!');
        clients.push(client);
        temp = roomno;
        if(io.nsps['/'].adapter.rooms["room-"+roomno] && io.nsps['/'].adapter.rooms["room-"+roomno].length > 1) {
            roomno++;
        }
        if(roomno!=temp){
            send();
            //whostart = Math.floor(Math.random()*1);
        }
        socket.join("room-"+roomno);
        console.log(io.nsps['/'].adapter.rooms["room-"+roomno].length);
        console.log(socket.name+" in room "+roomno);

        // if(io.nsps['/'].adapter.rooms["room-" + roomno].length != 2) {
        //     client.start=whostart;
        // }else{
        //     if(whostart==1){
        //         client.start = 0;
        //     }else if(whostart==0){
        //         client.start=1;
        //     }
        // }


        //Send this event to everyone in the room.
        //If there 2 ppl clicked button , emit sum
        if (io.nsps['/'].adapter.rooms["room-" + roomno].length == 2) {
            io.sockets.in("room-" + roomno).emit('connectToRoom', {
                descriptions: "You are in room no. " + roomno,
                num: num,
                sum: sum
            })
        } else {

        }
        //   socket.leave("room-"+roomno);
    });

    socket.on('disconnect',function (data) {  //cut name out when disconnect
        if(!socket.name) return;
        io.sockets.emit('broadcast',socket.name +' has left the chat');
        playerName.splice(playerName.indexOf(socket.name),1);
        io.sockets.emit('listOfUser',playerName);
        io.sockets.emit('broadcast', 'there are '+playerName.length+' online');
        console.log('# of users online : '+playerName.length);
    });
});

server.listen(3000, function () {
    console.log('Server listening at port : 3000');
});

function send(){
    for(i=0;i<5;i++){
        num[i] = Math.floor((Math.random() * 9)+1);
        number += " "+num[i];
        if(i==0){
            sum = num[i];
            quest = ""+num[i];
        }else {
            var op = Math.floor((Math.random() * 4) + 1);
            if (op == 1) {
                sum += num[i];
                quest += "+ " + num[i];
            } else if (op == 2) {
                sum -= num[i];
                quest += "-" + num[i];
            } else if (op == 3) {
                sum *= num[i];
                quest += "*" + num[i];
            } else {
                temp = sum;
                sum /= num[i];
                if(sum%num[i]==0) {
                    quest += "/" + num[i];
                }else{
                    sum =temp;
                    i--;
                }
            }
        }

    }

}
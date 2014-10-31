var io;
var gameSocket;
var movieData;

exports.initGame = function (sio, socket) {
    io = sio;
    gameSocket = socket;
    gameSocket.emit('connected', { message: "connected!" });
    gameSocket.on('hostBeginGame', hostBeginGame);
    gameSocket.on('hostCreateNewGame', hostCreateNewGame);//
    gameSocket.on('newData', newData);
    gameSocket.on('playerJoinGame', playerJoinGame);
    gameSocket.on('newAnswer', newAnswer);
    gameSocket.on('askNewQuestion', askNewQuestion);
    gameSocket.on('playerComplete', playerComplete); 
    movieData = getMovies();
}

function hostCreateNewGame() {  
    var thisGameId = (Math.random() * 100000) | 0; 
    this.emit('newGameCreated', { gameId: thisGameId, mySocketId: this.id }); 
    this.join(thisGameId.toString());
};
function playerJoinGame(data) {
    var sock = this;
    var room = gameSocket.manager.rooms["/" + data.gameId];
    if (room != undefined) {
        if (room.length < 2) {
            data.mySocketId = sock.id;
            sock.join(data.gameId);
            console.log('Player ' + data.playerName + ' joining game: ' + data.gameId);

            var newData = {
                gameId: data.gameId,
                playerName: data.playerName,
                mySocketId: sock.id,
                nrClients: room.length,
                allowed: "true",
            };

            io.sockets.in(data.gameId).emit('playerJoinedRoom', newData);
        }
        else {
            var newData = {
                allowed: "false"
            }
            io.sockets.socket(sock.id).emit('playerJoinedRoom', newData);
        }

    } else {
        this.emit('error', { message: "This room does not exist." });
        console.log('Player ' + data.playerName + ' could not join game: ' + data.gameId);
    }
}
function newData(data) {
    io.sockets.in(data.gameId).emit('newDataFromHost', data);
}
function newAnswer(data) {

    var newData = {
        score: data.score,
        who: data.who,
        socket: this.id
    }

    io.sockets.in(data.gameId).emit('newAnswerFromPlayer', newData);
}
function hostBeginGame(gameId) {
    var newData = {
        gameId: gameId,
        movies: movieData,
        questions: getQuestionNumbers()
    }
    io.sockets.in(gameId).emit('beginNewGame', newData);
}
function askNewQuestion(socketId) {
    io.sockets.socket(socketId).emit('newQuestion');
}
function playerComplete(newData) {
    io.sockets.in(newData.gameId).emit('playerCompleted', newData);
}

function getMovies() {
    var Client = require('node-rest-client').Client;
    client = new Client();
    client.get("http://localhost:8000/MovieService/GetData", function (data, response) {
        movieData = data;
    });
}
function getQuestionNumbers() {
    var questionNumbers = [];
    while (questionNumbers.length < 8) {
        var random = Math.floor((Math.random() * 249));
        if (questionNumbers.indexOf(random) == -1) {
            questionNumbers.push(random);
        }
    }
    return questionNumbers;
}


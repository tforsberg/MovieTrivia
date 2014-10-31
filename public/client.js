$(function ($) {
    'use strict';
    var IO = {

        init: function () { 
            IO.socket = io.connect();
            IO.bindEvents();
        },
        bindEvents: function () {//
            IO.socket.on('connected', IO.onConnected);
            IO.socket.on('newGameCreated', IO.onNewGameCreated);
            IO.socket.on('newDataFromHost', IO.newDataFromHost);
            IO.socket.on('playerJoinedRoom', IO.playerJoinedRoom);
            IO.socket.on('beginNewGame', IO.beginNewGame);
            IO.socket.on('newAnswerFromPlayer', IO.newAnswerFromPlayer);  
            IO.socket.on('newQuestion', App.Host.askQuestion);    
            IO.socket.on('playerCompleted', App.Player.onPlayerComplete);
            IO.socket.on('newWordData', IO.onNewWordData);
            IO.socket.on('hostCheckAnswer', IO.hostCheckAnswer);
        },
        onConnected: function () {//
            // Cache a copy of the client's socket.IO session ID on the App
            App.mySocketId = IO.socket.socket.sessionid;//
            // console.log(data.message);//
        },
        onNewGameCreated: function (data) {
            App.Host.gameInit(data);
            App.Player.onJoinClick();
        },
        newDataFromHost : function(data)
        {
            App.$content.html(App.$templateNewGame);
            $('#spanNewGameCode').text("Game ID : " + data.gameId);
            $('#player1Score').find('.playerName').html(data.player1Name);
            $('#player2Score').find('.playerName').html(data.player2Name);   
        },
        playerJoinedRoom: function (data) {
            App.gameId = data.gameId;
            App.Player.updateWaitingScreen(data);
        },
        playerJoinRoomRequestResponse: function (data)
        {
            Host.numPlayersInRoom = data.nrClients;
        },
        beginNewGame: function (data) {
            var obj = jQuery.parseJSON(data.movies);
            App.Player.movies = jQuery.parseJSON(obj);
            App.Player.playerquestions = data.questions;
            App.Host.askQuestion();
            $("#readyBlock").removeClass("show").addClass("hide");
            $("#playGame").removeClass("hide").addClass("show");
        },
        newAnswerFromPlayer: function (data) {
            if (data.who == "Host") {
                $('#player1Score').find('.score').html(data.score);
            }
            else {
                $('#player2Score').find('.score').html(data.score);
            }
        },
    };

    var App = {
        movies: '',
        appStatus: "Status : ",
        gameId: 0,
        myRole: '', //'Player' or 'Host'
        mySocketId: '',
        currentRound: 0,

        init: function () {
            App.cacheElements();
            App.showInitScreen();
            App.bindEvents();
            FastClick.attach(document.body);
        },
        cacheElements: function () {
            App.$doc = $(document);
            App.$content = $('#content');
            App.$templateIntroScreen = $('#intro-template').html();
            App.$templateNewGame = $('#game-template').html();
            App.$templateComplete = $('#complete-template').html();
        },
        bindEvents: function () {
            App.$doc.on('click', '#btnCreateGame', App.Host.onCreateClick);//
            App.$doc.on('click', '#btnJoinGame', App.Player.onJoinClick);
            App.$doc.on('click', '#btnAnswer1', App.Player.onPlayerAnswerClick1);
            App.$doc.on('click', '#btnAnswer2', App.Player.onPlayerAnswerClick2);
            App.$doc.on('click', '#btnAnswer3', App.Player.onPlayerAnswerClick3);
            App.$doc.on('click', '#btnAnswer4', App.Player.onPlayerAnswerClick4);
            App.$doc.on('click', '#btnExit', App.Player.onPlayerExitClick);
        },
        showInitScreen: function () {
            App.$content.html(App.$templateIntroScreen);
            App.doTextFit('.title');
        },

        Host: {
            players: [],
            scores: [],
            isNewGame: false,
            numPlayersInRoom: 0,

            onCreateClick: function () {//
                IO.socket.emit('hostCreateNewGame');//
            },
            gameInit: function (data) {

                App.gameId = data.gameId;
                App.mySocketId = data.mySocketId;
                App.myRole = 'Host';
                App.Host.numPlayersInRoom = 0;

                $('#inputGameId').val(App.gameId);
                $('#readyArea2').text(App.gameId);

                $("#readyBlock").removeClass("hide").addClass("show");
                $("#playGame").removeClass("show").addClass("hide");
            },
            displayNewGameScreen: function (isFull) {
                if (App.myRole === "Host") {
                    
                    if (App.Host.players.length < 2) {

                        var newData = {
                            gameId: +($('#inputGameId').val()),
                            player1Name: App.Host.players[0].playerName,
                            player2Name: "Player 2",
                            status: "Waiting..."
                        };
                    }
                    else {

                        var newData = {
                            gameId: +App.gameId,
                            player1Name: App.Host.players[0].playerName,
                            player2Name: App.Host.players[1].playerName,
                            status: "Play!!"
                        };

                    }
                    IO.socket.emit('newData', newData);

                    if (isFull === "TRUE")
                    {
                        IO.socket.emit('hostBeginGame', App.gameId);
                    }

                }
            },
            askQuestion: function()
            {

                //alert(App.Player.movies[App.Player.playerquestions[App.Player.currentQuestionNr]].Title);
                //alert(App.Player.movies[App.Player.playerquestions[App.Player.currentQuestionNr]].Year);

                var Question = App.Player.movies[App.Player.playerquestions[App.Player.currentQuestionNr]].Title;
                var Answer = App.Player.movies[App.Player.playerquestions[App.Player.currentQuestionNr]].Year;

                //alert(Question);
                //alert(Answer);

                //For testing
                $("#inputAnswer").val(Answer);


                $('#questionArea1').text('In what year was the following movie released? :');
                $('#questionArea').text(Question);


                
                //"In what year was the following movie released? :"

                App.Player.currentCorrectAnswer = Answer;
                App.Player.currentQuestionNr++;


                //generate 3 random years between 1921 and year.now and add correct year
                var Answers = App.Host.generateArrayItems(Answer);

                //shuffle array
                Answers.sort(function () { return 0.5 - Math.random() });

                $("#btnAnswer1").val(Answers[0]);
                $("#btnAnswer2").val(Answers[1]);
                $("#btnAnswer3").val(Answers[2]);
                $("#btnAnswer4").val(Answers[3]);

            },
            generateArrayItems: function(correctItem)
            {
                //alert("123");

                var arr = [];
                arr.push(correctItem);

                //alert(arr[0]);

                var max = (new Date().getFullYear());
                var min = 1921;

                //alert(max);
                //alert(min);

                while (arr.length <= 4) {

                    var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

                    //alert(randomNumber);

                    if ($.inArray(randomNumber, arr) == -1) {
                        arr.push(randomNumber);
                    }

                }

                //alert(arr[0]);
                //alert(arr[1]);
                //alert(arr[2]);
                //alert(arr[3]);

                return arr;
            },

        },

        Player: {

            hostSocketId: '',
            myName: '',
            movies: '',
            playerquestions: [],
            currentQuestionNr: 0,
            currentCorrectAnswer: '',
            score : 0,
            firtsCompleteScore: 0,

            onJoinClick: function () {

                //alert("JION!!!");


                if (App.Host.numPlayersInRoom < 2)
                {
                    

                    // collect data to send to the server
                    var data = {
                        gameId: +($('#inputGameId').val()),
                        playerName: $('#inputPlayerName').val() || 'anon'
                    };

                    // Send the gameId and playerName to the server
                    IO.socket.emit('playerJoinGame', data);

                    // Set the appropriate properties for the current player.
                    if (App.myRole != "Host") {
                        App.myRole = 'Player';
                    }

                    App.Player.myName = data.playerName;
                }
                else
                {
                    alert("Room Full!! - Try another room or create your own");
                }

            },
            onPlayerStartClick: function () {
                // console.log('Player clicked "Start"');

                // collect data to send to the server
                var data = {
                    gameId: +($('#inputGameId').val()),
                    playerName: $('#inputPlayerName').val() || 'anon'
                };

                // Send the gameId and playerName to the server
                IO.socket.emit('playerJoinGame', data);

                // Set the appropriate properties for the current player.
                App.myRole = 'Player';
                App.Player.myName = data.playerName;
            },
            updateWaitingScreen: function (data) {

                if (data.allowed == "true") {
                    var isFull = "";
                    App.Host.players.push(data);
                    if (data.nrClients === 2) {
                        isFull = "TRUE"; 
                    }
                    else {
                        App.appStatus = "Waiting For Another Player to Join..";
                    }
                    App.Host.displayNewGameScreen(isFull);
                }
                else {
                    alert("Room Full!!");
                }
            },

            onPlayerAnswerClick1: function ()
            {App.Player.onPlayerAnswerClick($("#btnAnswer1").val()) },
            onPlayerAnswerClick2: function()
            { App.Player.onPlayerAnswerClick($("#btnAnswer2").val()) },
            onPlayerAnswerClick3: function()
            { App.Player.onPlayerAnswerClick($("#btnAnswer3").val()) },
            onPlayerAnswerClick4: function()
            { App.Player.onPlayerAnswerClick($("#btnAnswer4").val()) },

            onPlayerAnswerClick: function (answer) {


                if (answer == App.Player.currentCorrectAnswer) {
                    App.Player.score = App.Player.score + 5;
                }
                else {
                    App.Player.score = App.Player.score -3;
                }

                var newData = {
                    gameId: +App.gameId,
                    score: App.Player.score,
                    who: App.myRole
                }
                IO.socket.emit('newAnswer', newData);

                if (App.Player.currentQuestionNr < 8)
                {
                    App.Host.askQuestion();
                }
                else
                {
                    var newData = {
                    gameId: +App.gameId,
                    score: App.Player.score,
                    name: App.Player.myName,
                    socket: App.mySocketId
                    };

                    IO.socket.emit('playerComplete', newData);
                }
            },
            onPlayerComplete:function (data)
            {
                if (data.socket == App.mySocketId) {
                    App.$content.html(App.$templateComplete);
                }

                if (App.Player.firtsCompleteScore == 0)
                {
                    App.Player.firtsCompleteScore = data.name + " : " + data.score;
                    $('#firstComplete').text(App.Player.firtsCompleteScore);
                }
                else
                {
                    $('#firstComplete').text(App.Player.firtsCompleteScore);
                    $('#secondComplete').text(data.name + " : " + data.score);
                }
            },
            onPlayerExitClick: function ()
            {
                App.$content.html(App.$templateIntroScreen);
                App.doTextFit('.title');
            }
        },

        doTextFit: function (el) {
            textFit(
                $(el)[0],
                {
                    alignHoriz: true,
                    alignVert: false,
                    widthOnly: true,
                    reProcess: true,
                    maxFontSize: 300
                }
            );
        }
    };

    IO.init();
    App.init();

});



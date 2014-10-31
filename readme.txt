//TECHNOLOGIES / LANGUAGES / TOOLS USED
_______________________________________________________________________________________________________________________________
WCF 
node.js
jquery
javascript
css
html
c#
Visual Studio 2013



//KNOWN ISSUES
_______________________________________________________________________________________________________________________________

After Exit - If you want to start a new game you need to first refresh (ctrl f5 ) the start page - else the questions do not come up when joining a game

No Code comments



//INSTALL AND RUN  ( Internet Connection needed to run )
_______________________________________________________________________________________________________________________________

Download and install node.js from http://nodejs.org/


---------IN CMD----------------------

//Install Dependencies
cmd webApplicationDir /npm install

Dependencies will auto install from package
"express": "3.x",
        
"socket.io": "0.9",
        
"node-rest-client": "1.4.1"


//Start web server
cmd webApplicationDir  /node index.js


//Start Game
http://HostName:8888/





//To HOST WCF SERVICE  
webApplicationDir\External\HostingConsoleApplication\HostingConsoleApplication\bin\Debug\HostingConsoleApplication.exe
Keep Console open during execution



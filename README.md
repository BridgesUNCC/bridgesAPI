bridgesAPI
==========

Assignment visualization and data delivery API

If you want to start using BRIDGES, check out https://bridgesuncc.github.io/ 

Check out some visualizations at http://bridges-cs.herokuapp.com/

## Running BRIDGES on a local server (like your own machine) 

## OSX:

1. Use brew for installation - this is the simplest; if you dont have it,
its at https://brew.sh/
2. Install git : brew install git
3. Install MongoDB (Community Edition). Detailed instructions at  at https://docs.mongodb.com/manual/tutorial/install-mongodb-on-os-x/.  You
need to do the following steps:
	- brew tap mongodb/brew
	- brew install mongodb-community@4.2 (or whatever version is current)
	- mongod --config /usr/local/etc/mongod.conf  (usint the fork doesnt seem to 	work, so ignore that)
	- brew services start mongodb-community@4.2 (starts the deamon)
	(the command with 'stop' will stop the service)
	- [Check if mongod is running]: ps aux|grep mongod 
4. Xcode - make sure you have a fairly recent version of Xcode - typically
you need to go the App Store if you want the latest, but if you are running
older OSX version, go to Xcode downloads at https://developer.apple.com/download/more/?q=xcode; you will need Apple ID for download; make sure you get the version compatible to your version of OSX! Also make sure command line tools are installed. To check run 
	- xcode-select --install
5. Install npm and npm related tools
	- Npm:    brew install npm
	- Yeoman: npm install -g yo  
	- Grunt:  npm install grunt
	- Bower:  npm install bower
	- run 'rehash' to update command paths
6. Check Dependencies 
	- npm install  
	- bower install  
7. Get the Bridges API repo:
	- git  clone https://github.com/BridgesUNCC/bridgesAPI.git  
	- cd to the server repo directory
8. Run these within the server directory:
	- git submodule init
	- git submodule update
9. Run grunt in the root directory  to start the server
	- cd
	- grunt &
10. To run Bridges examples, you will need to set your server to point to 
the local server (your machine and address http://127.0.0.1:3000), wherever you create the Bridges object
in your application:
	- bridges.setServer("local")
11. Create yourself a Bridges account on your local server: 127.0.0.1:3000. Use
	your credentials in your application.
12. Thats it!

## Linux:

1. Install git
2. Install mongoDB and run it in the background: (Debian install: [https://docs.mongodb.com/manual/administration/install-on-linux/]
3. Make sure you have an uptodate C/C++ compiler and related tools
4. [Install node and npm][nodenpm](node's package manager) 
5. Follow steps 5 through 12 in the OSX section (substituting Linux install 
tools for brew)
	

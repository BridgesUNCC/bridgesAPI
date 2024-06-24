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

# Ubuntu Bridges API Install Documentation

## Installation steps:
1. Install git at home directory v. 2.25.1 (or latest version)
    ```bash
    sudo apt-get install git-all
    ```
2. Install [**MongoDB 5.0**](https://www.mongodb.com/docs/v5.0/tutorial/install-mongodb-on-ubuntu/) 
    ```bash
    sudo apt-get install gnupg curl
    ```
    ```bash
    curl -fsSL https://www.mongodb.org/static/pgp/server-5.0.asc | \ sudo gpg -o /usr/share/keyrings/mongodb-server-5.0.gpg \ -dearmor
    ```
    ```bash
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-5.0.gpg ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
    ```
    ```bash
    sudo apt-get update
    ```
    ```bash
    sudo apt-get install -y mongodb-org=5.0.27 mongodb-org-database=5.0.27 mongodb-org-server=5.0.27 mongodb-org-shell=5.0.27 mongodb-org-mongos=5.0.27 mongodb-org-tools=5.0.27
    ```
    ```bash
    sudo systemctl start mongod
    ```
    ```bash
    sudo systemctl status mongod
    ```

3. Install C compiler

    ```bash
    sudo apt install gcc
    ```

4. Install NodeJS **Version 16** and npm
    ```bash
    sudo apt update
    ```
    ```bash
    sudo curl -s https://deb.nodesource.com/setup_16.x | sudo bash
    ```
    ```bash
    sudo apt install nodejs -y
    ```
    ```bash
    sudo apt install npm    
    ```
5. Install npm related tools
    ```bash
    sudo npm install -g yo
    ```
6. Get the Bridges API repo:
    ```bash
    git clone https://github.com/BridgesUNCC/bridgesAPI.git
    ```
* cd to your server repo directory
    
    ```bash
    npm install grunt
    ```
    ```bash
    npm install bower
    ```
    ```bash
    sudo npm install -g grunt-cli
    ```
    ```bash
    git submodule init
    ```
    ```bash
    git submodule update
    ```
    ```bash
    grunt &
    ```

* Potentially debug (make sure the node verson in package.json matches the one that you installed)

### If all the installs are successfull, Bridges should be running locally [here](http://localhost:3000/)
    
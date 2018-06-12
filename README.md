bridgesAPI
==========

Assignment visualization and data delivery API

If you want to start using BRIDGES, check out https://bridgesuncc.github.io/ 

Check out some visualizations at http://bridges-cs.herokuapp.com/

### Running a local version of BRIDGES

Overview:
1. Install git
2. Install mongoDB and run it in the background
3. [Install node and npm][nodenpm](node's package manager) 
4. Use 'npm install' and 'bower install' to retrieve all dependencies
5. Run 'grunt' in the root directory to start the local server!


On OSX? Install mongoDB, node, npm, and yeoman using [homebrew][hbrew] 
[hbrew]:http://brew.sh/


### Detailed Setup 
First we need our task runner, dependency manager and scaffold generators (you don't need to know what they are)

```
npm install -g yo 
```

Then we need to get BRIDGES' server code

```
git clone https://github.com/squeetus/bridgesAPI
```  

We install it (bower needs --allow-root to be sudoed)

```
npm install
bower install
git submodule init
git submodule update
```

```
mongod & 
grunt
```    
If bower install doesn't work, try the following: 
```
git config --global url."https://".insteadOf git://
```

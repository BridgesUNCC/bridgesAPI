
# mongo crash course

##Connecting

connect to mongo db from the terminal using:

mongo ds163400-a0.mlab.com:63400/bridges-db -u esaule -p 'SECRETPASSWORD'

Check the name of the server carefully. it may change over time. Log on mlab.com to get the correct name of the server.

In debian, the shell comes from the mongodb-clients package in "deb http://repo.mongodb.org/apt/debian stretch/mongodb-org/4.0 main". For MacOS there is a brew package, see https://github.com/mongodb/homebrew-brew .

## Basics of mongo db

The mongo client is a javascript interpretor that supports various objects and stuff to use with mongo. For instance, this commands gives you all user account on BRIDGES:

```javascript
db.users.find(  );
```

There are two main collection on the BRIDGES mongo database, users for user accounts and assignments to store the actual assignments. You can filter out only the documents you want to get by passing to find a "template" of what you are looking for. For instance:

```javascript
db.users.find( { username : "kalpathi60"} );
```

will give kr's account.

You can get all assignments using but I recommend not running it since there are SO many of them.

```javascript
db.accounts.find( );
```

The template does not have to be exact. It can be parametrized. For instance, here is a command that gives you all the assignments from kr from after january 17, 2020:

```javascript
db.assignments.find( { username: "kalpathi60", "dateCreated": {$gt: new Date('2020-01-17') } }  );
```

all of kr's assignment before jan 17, 2019:

```javascript
db.assignments.find( { username: "kalpathi60", "dateCreated": {$lt: new Date('2019-01-17') } }  );
```

Or you can find all users whose username start with "esa" by using a regular expression:

```javascript
db.users.find( { username : { $regex: /esa.*/ } );
```

All these $something are called operators in mongo. There are a lot of them, check the documnetation for mongo queries at : https://docs.mongodb.com/manual/tutorial/query-documents/ . And yes, it is a weird language.

You can remove an assignment using the .remove() command. This command removes exactly one assignment that match the template. No need to tell you how critical it is to be careful with that!!!!!!!!!!!

```javascript
db.assignments.remove( { username: "kalpathi60", assignmentNumber : "7" } , {justOne: true} );
```

Usually you would get an error because you don't have write permissions. The first try gave me:

```javascript
rs-ds163400:PRIMARY> db.assignments.remove( { username: "kalpathi60", assignmentNumber : "7" } , {justOne: true} );
WriteResult({
        "writeError" : {
                "code" : 13,
                "errmsg" : "not authorized on bridges-db to execute command { delete: \"assignments\", deletes: [ { q: { username: \"kalpathi60\", assignmentNumber: \"7\" }, limit: 1.0 } ], ordered: true, $db: \"bridges-db\" }"
        }
})
```

You can check the permission for your user with:

```javascript
db.getUser("esaule");
```

See what I get, I only have read permissions:

```javascript
{
        "_id" : "bridges-db.esaule",
        "user" : "esaule",
        "db" : "bridges-db",
        "roles" : [
                {
                        "role" : "read",
                        "db" : "bridges-db"
                }
        ]
}
```

You can change the permission on mlab.com. by clicking on database and then on users.

# Managing the size of the database

## Getting an idea of which account uses data

Here is a command that gives you an idea of which user account uses the most data. It is just an idea because this uses the size of the assignments when JSON represented, but mongo keeps BSON formats plus indexing and stuff.

```javascript
mysum = {}; db.assignments.aggregate( []).forEach( function(foo){ lsize = JSON.stringify(foo).length; if (foo.email in mysum  ) {mysum[foo.email] += lsize} else { mysum[foo.email]=lsize;; } }  ); mysum;
```

aggregate works with a slightly different syntax, here is how to filter assignment based on date and compute their sum size:

```javascript
mysum = {}; db.assignments.aggregate( [ { $match: {"dateCreated" :  { $gt : new Date('2020-01-15')}  }} ]).forEach( function(foo){ lsize = JSON.stringify(foo).length; if (foo.email in mysum  ) {mysum[foo.email] += lsize} else { mysum[foo.email]=lsize;; } }  ); mysum;
```

## Cleaning up

Removing old assignments:

```javascript
db.assignments.removeMispelledOnPurpose (
    {$and : [
	{ "username": { $not: { $eq: "bridges_public"}}},
	{ "username": { $not: { $eq: "bridges_workshop"}}},
	{ "dateCreated": {$lt: new Date('2019-08-10') }}
    ]
    },
    {}
)
```

Removing assignments from the bridges team:

```javascript
db.assignments.removeMispelledOnPurpose (
    {$or : [
	{ "username": "esaule"},
	{ "username": "kalpathi60"},
	{ "username": "dburlins"},
	{ "username": "lsloop4"},
	{ "username": "agoncharow"},
	{ "username": "jstrahler"},
      ]
    },
    {}
)
```

## Compacting file size

To reduce the file usage on mlab one needs to compact the database, resync the secondary, failover the primary which becomes secondary, resync the new secondary, and you are done. To compact the database run:

```javascript
db.runCommand({compact:'assignments', force:true})
```

Note that this is causing downtime. So beware!!! The resync, failover, and resync are done from mlab's dashboard.



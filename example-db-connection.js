//Example code for how to connect to our mongo db hoasted on MongoDB Atlas.
//The code below makes a insertion to our live db so please be sure to remove the appended information when running this :)
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

//need to insert your username nad password in the below url for database connection to work.
const uri = "mongodb+srv://<username>:<password>@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true/lindr";

//Code showing how to make connection and insert one doc into collection
MongoClient.connect(uri, async function(err, client) {
	var db = client.db('test');
	console.log(db);
	console.log("client:\n");
	console.log(client);

	var loanCollection = db.collection("Loans");
	var doc1 = {'hello':'doc1'};
	var doc2 = {'hello': 'doc2'}
	var userCollection = db.collection("Users");

	await loanCollection.insertOne(doc1, function(err, result) {
		assert.equal(err,null);
		console.log(err);
	});

	await userCollection.insertOne(doc2, function(error, result){
		assert.equal(err,null);
		console.log(err);
	});

	MongoClient.close;
});


//Code showing how to make connection and get all child elements of a collection
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const uri = "mongodb+srv://andrewmckinnon2:Pass4wed@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true/lindr"


MongoClient.connect(uri, async function(err, client) {
	if(err) {console.log(client);}
	var db = client.db('test');
	var loanCollection = db.collection("Loans");
	var userCollection = db.collection("Users");

	var loanItems = await loanCollection.find().toArray();
	var userItems = await userCollection.find().toArray();

	console.log("\nloanItems\n");
	console.log(loanItems);
	console.log("\nuserItems\n");
	console.log(userItems);

});

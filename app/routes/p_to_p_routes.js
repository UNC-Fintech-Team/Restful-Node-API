//var MongoClient = require('mongodb').MongoClient;
//var uri = 'mongodb+srv://<username>:<password>@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true';
var bodyParser = require('body-parser');
var check_for_nulls = require('./util/input_verification.js').check_for_nulls;

module.exports = function(app, db) {
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(bodyParser.json());
  app.get('/notes', (req, res) => {
     res.send('Hello');
   });

   app.put('/user_creation', (req, res) => {
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let email = req.body.email;
    let password = req.body.pass;
    let preferred_mode = req.body.pmode;
    let lender_data = req.body.lrdata;
    let lendee_data = req.body.ledata;
    let bio = req.body.bio;

    var inputs = [first_name, last_name, email, password, preferred_mode,
    bio];
    console.log("value of inputs before submission to not_null are:\n");
    console.log(inputs);

    let not_null = check_for_nulls(inputs);

    if(not_null){
      //send success response
      res.statusCode = 200;
      res.send({success:"User creation successful"});
    } else {
      //send failure response
      res.statusCode = 400;
      res.send({error:"Some input body params were null"});
    }
   });

   app.get('/user_info', (req, res) => {
     res.send('Hello');
   });

   app.put('/update_preferences', (req, res) => {
     res.send('Hello');
   });

   app.put('/make_match', (req, res) => {
     res.send('Hello');
   });

   app.get('/matches', (req, res) => {
     res.send('Hello');
   });

   app.get('/loans', (req, res) => {
     res.send('Hello');
   });

   app.post('/loan', (req, res) => {
     res.send('Hello');
   });
};

/*var check_for_nulls = function(arr){
  for(let i=0; i<arr.length; i++){
    if(arr[i] == null){
      return false;
    }
  }
  return true;
}*/

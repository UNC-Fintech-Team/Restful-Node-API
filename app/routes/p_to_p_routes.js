//var MongoClient = require('mongodb').MongoClient;
//var uri = 'mongodb+srv://<username>:<password>@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true';
var bodyParser = require('body-parser');
var check_for_nulls = require('./util/input_verification.js').check_for_nulls;
var ObjectId = require('mongodb').ObjectID;

const MongoClient = require('mongodb').MongoClient;
const uri = 'mongodb+srv://andrewmckinnon2:Pass4wed@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true';


module.exports = function(app, db) {
  app.use(bodyParser.urlencoded({extended:true}));
  app.use(bodyParser.json());
  app.get('/notes', (req, res) => {
     res.send('Hello');
   });

   app.put('/user_creation', async (req, res) => {
     //API end point for user creation.
    let first_name = req.body.fname;
    let last_name = req.body.lname;
    let email = req.body.email;
    let password = req.body.pass;
    let preferred_mode = req.body.pmode;
    let loan_data = []; //req.body.ldata;
    let bio = req.body.bio;

    var inputs = [first_name, last_name, email, password, preferred_mode,
    bio];

    let not_null = check_for_nulls(inputs);

    if(not_null){
      //send success response
      MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
        let db = client.db('lindr');
        let user_collection = db.collection("Users");

        await user_collection.insertOne({
          "first_name":first_name,
          "last_name":last_name,
          "email":email,
          "password":password,
          "preferred_mode":preferred_mode,
          "loan_data":loan_data,
          "bio":bio
        }, (err, result) =>{
          console.log("err val is " + err);
        })


      })

      res.statusCode = 200;
      res.send({success:"User creation successful"});
    } else {
      //send failure response
      res.statusCode = 400;
      res.send({error:"Some input body params were null"});
    }
   });

   app.get('/user_info', async (req, res) => {
     //API endpoint for getting user object from backend based on email and password passed through request.
     var email = req.query.email;
     var password = req.query.pass;
     var user_result = [];

     await MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client){
         if(err) throw err;
         let db = client.db('lindr');
         let user_collection = db.collection("Users");

         console.log("email: " + email + "\n");
         console.log("password: " + password + "\n");
         user_result = await user_collection.find({"email":email, "password":password}).toArray();

         console.log("user_result:\n");
         console.log(user_result);
         console.log("user_result.length:\n");
         console.log(user_result.length);

         if(user_result.length == 0){
           //did not find a result with the specified email.
           res.statusCode = 400;
           res.send({error:"Could not find a user with that email/password"})
         } else {
           //found result with specified email.
           res.statusCode = 200;
           res.send(user_result[0]);
         }

       })
   });

   app.put('/update_preferences', async (req, res) => {
     //API end point to update a users preferences
     let email = req.body.email;
     let password = req.body.pass;
     let preferred_mode = req.body.pmode;
     let bio = req.body.bio;

     inputs = [email, password, preferred_mode, bio];

     let not_null = check_for_nulls(inputs);

     if(not_null){
       //send success response
       MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
         let db = client.db('lindr');
         let user_collection = db.collection("Users");

         await user_collection.updateOne(
           {"email":email, "password":password},
           {
             $set:{"preferred_mode":preferred_mode, "bio":bio}
           },
           function(err, result) {
             if(err) throw err;
           }
         )

         res.statusCode = 200;
         res.send({success:"Successfully updated preferences"});

       })

     } else {
       //send failure response
       res.statusCode = 400;
       res.send({error:"some input body params were null"});
     }
   });

   app.put('/make_loan_request', async (req, res) => {
     //API end point for making a loan request
     //get user credentials
     let email = req.body.email;
     let password = req.body.pass;

     //get user provided information for setting up loan
     let quantity = req.body.quant;
     let interest_rate = req.body.interest;
     let purpose = req.body.purpose;
     let payment_plan = req.body.payment;
     let payment_increments = req.body.increments; //number of paymenst to be made

     //set values for loan prior to matching.
     let status = "pending";
     let loanee_id = null;
     let loaner_id = null;
     let payment_date = null;
     let amount_unpaid = quantity;

     let date = new Date();
     let time_created = date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();

     let inputs = [quantity, interest_rate, purpose, payment_plan, payment_increments];

     let not_null = check_for_nulls(inputs);

     if(not_null){
       MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loans_collection = db.collection("Loans");

         let user = await user_collection.find({"email":email, "password":password}).toArray();
         loanee_id = user[0]._id;

         //TODO: Write new loan to db and to loanee loan list

         let created_loan = await loans_collection.insertOne({
           "status":status,
           "quantity":quantity,
           "interest_rate":interest_rate,
           "purpose":purpose,
           "payment_plan":payment_plan,
           "loanee_id":loanee_id,
           "loaner_id":loaner_id,
           "payment_increments":payment_increments,
           "payment_date":payment_date,
           "time_created":time_created
         })



         await user_collection.updateOne(
           {"email":email, "password":password},
           {$push: {
             "loan_data":
                {
                  "uid":created_loan.insertedId,
                  "status":status,
                  "role":"loanee"
                }
            }
           }
         )

         //send success code
         res.statusCode = 200;
         res.send({success:"Successfully created loan request"});
       })

     } else {
       //some of req body was null, send error response back from server.
       res.statusCode = 400;
       res.send({error:"Some input body params were null"});
     }

   })

   app.put('/make_match', async (req, res) => {
     //API endpoint for making a match on a loan. Should send information of lender along with loan id
     let loan_id = new ObjectId(req.body.loanId);
     let loaner_email = req.body.email;


     let inputs = [loan_id, loaner_email];
     let not_null = check_for_nulls(inputs);

     if(not_null){
       MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loans_collection = db.collection("Loans");

         let user_data = await user_collection.find({"email":loaner_email}).toArray();
         let user = user_data[0];

         //update status of loan in loans_collection
         await loans_collection.updateOne(
           {"_id":loan_id},
           {$set:{"loaner_id":user._id, "status": "matched"}}
         )

         //update status of loan in loaner node of user_collection
         await user_collection.updateOne(
           {"email":loaner_email},
           {$push: {
              "loan_data":
              {
                  "uid":loan_id,
                  "status":"matched",
                  "role":"loaner"
              }
            }
          })

          //get unique id of loanee
          let loan_data = await loans_collection.find({"_id":loan_id}).toArray();
          let loan = loan_data[0];
          let loanee_id = loan.loanee_id;

          //update loanee information to reflect the new loan match
          await user_collection.updateMany(
            {"_id":loanee_id},
            {$set:
              {"loan_data.$[element].status":"matched"
              }
            },
            {
              arrayFilters:[{"element.uid":{$eq:loan_id}}]
            }
          )

          //send success code back to front end.
          res.statusCode = 200;
          res.send({success:"successfully matched on loan"});
       })
     } else {
       //send error code; some inputs contained null values.
       res.statusCode = 400;
       res.send({error:"One or more inputs were null"});
     }


   });

   app.get('/matches', async (req, res) => {
     //API endpoint for getting all matched loans for a given user
     let email = req.query.email;
     let inputs = [email];

     let not_null = check_for_nulls(inputs);

     if(not_null){
       await MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client){
         if(err) throw err;
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loan_collection = db.collection("Loans");

         //get all loan ids associated with a given user that are matched.
         let user = await user_collection.find({"email":email}).toArray();

         let user_loans = user[0].loan_data;
         let loan_ids = [];
         for(let i=0; i<user_loans.length; i++){
           if(user_loans[i].status == "matched"){
             loan_ids.push(user_loans[i].uid);
           }
         }

         //get all loans from loan_collection that have id from loan_ids
         let matched_loans = await loan_collection.find({
           "_id": { $in: loan_ids }
         }).toArray();

         //return array of matched loans to front end.
         res.statusCode = 200;
         res.send(matched_loans);
       })
     } else {
       //return failure status code to front end if some vals are null
       res.statusCode = 400;
       res.send({error: "Some arguments sent in request are null"});
     }

   });

   app.get('/complete', async (req, res) => {
     //Endpoint for all completed loans for a user
     let email = req.query.email;
     let inputs = [email];

     let not_null = check_for_nulls(inputs);

     if(not_null){
       await MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client){
         if(err) throw err;
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loan_collection = db.collection("Loans");

         //get all loan ids associated with a given user that are matched.
         let user = await user_collection.find({"email":email}).toArray();

         let user_loans = user[0].loan_data;
         let loan_ids = [];
         for(let i=0; i<user_loans.length; i++){
           if(user_loans[i].status == "complete"){
             loan_ids.push(user_loans[i].uid);
           }
         }

         //get all loans from loan_collection that have id from loan_ids
         let matched_loans = await loan_collection.find({
           "_id": { $in: loan_ids }
         }).toArray();

         //return array of matched loans to front end.
         res.statusCode = 200;
         res.send(matched_loans);
       })
     } else {
       //return failure status code to front end if some vals are null
       res.statusCode = 400;
       res.send({error: "Some arguments sent in request are null"});
     }
   })

   app.get('/pending', async (req, res) => {
     //Endpoint for all pending loans for a user
     let email = req.query.email;
     let inputs = [email];

     let not_null = check_for_nulls(inputs);

     if(not_null){
       await MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client){
         if(err) throw err;
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loan_collection = db.collection("Loans");

         //get all loan ids associated with a given user that are matched.
         let user = await user_collection.find({"email":email}).toArray();

         let user_loans = user[0].loan_data;
         let loan_ids = [];
         for(let i=0; i<user_loans.length; i++){
           if(user_loans[i].status == "pending"){
             loan_ids.push(user_loans[i].uid);
           }
         }

         //get all loans from loan_collection that have id from loan_ids
         let matched_loans = await loan_collection.find({
           "_id": { $in: loan_ids }
         }).toArray();

         //return array of matched loans to front end.
         res.statusCode = 200;
         res.send(matched_loans);
       })
     } else {
       //return failure status code to front end if some vals are null
       res.statusCode = 400;
       res.send({error: "Some arguments sent in request are null"});
     }
   })

   app.get('/unmatched_loans', async (req, res) => {
     //API endpoint to get loans that have not yet been matched; should be used for giving users loan requests to swipe on
     let email = req.query.email;

     let inputs = [email];
     let not_null = check_for_nulls(inputs);
     if(not_null){
       MongoClient.connect(uri, { useNewUrlParser: true }, async function(err, client) {
         let db = client.db('lindr');
         let user_collection = db.collection("Users");
         let loan_collection = db.collection("Loans");

         let user_arr = await user_collection.find({"email":email}).toArray();

         if(user_arr.length != 1){
           res.statusCode = 400;
           res.send({error:"could not find user with email sent in request"});
           return;
         }
         let user = user_arr[0];

         let unmatched_loans = await loan_collection.find({"status":"pending"}).toArray();

         res.statusCode = 200;
         res.send(unmatched_loans);
       });
     } else {
       res.statusCode = 400;
       res.send({error:"Some parameters passed to this endpoint were null"});
     }



   });


};

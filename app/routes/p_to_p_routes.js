var MongoClient = require('mongodb').MongoClient;
var uri = 'mongodb+srv://andrewmckinnon2:Pass@4wed123!!!@lindrcluster-ifwaa.gcp.mongodb.net/test?retryWrites=true';

module.exports = function(app, db) {
  app.get('/notes', (req, res) => {
     res.send('Hello');
   });

   app.post('/user_creation', (req, res) => {
     res.send('Hello');
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

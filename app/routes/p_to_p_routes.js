module.exports = function(app, db) {
  app.get('/notes', (req, res) => {
     res.send('Hello');
   });
};

'use strict';

const request        = require('request');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
// var loopback = require('loopback');
const async          = require('async');

module.exports = function(app) {
  var router  = app.loopback.Router();
  var groceryController = require('../controllers/grocery-controller');
  
  









 //:todo add relations and display whole information about 
 //:todo make it more protected from view
  router.get('/view/grocery/:groceryId', 
    ensureLoggedIn('/auth/account'),
    async  (req, res, next) => {
      var groceryId  = req.params.groceryId;
      var ultimateGL = {};
      var response   = {};
      let admin
      try {

        var User = app.models.user;

        // this is a duplicated code. :todo
        admin    = await User.findOne(User.queryUltimateAdmin());

        var json     = admin.toJSON();
        var ultimate = json.groceries[0];
        ultimateGL = {
          id: ultimate.id,
          name: ultimate.name
        };

        
      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e) 
      }


      let grocery
      try {      
         var Grocery   = app.models.Grocery;
         // grocery = await Grocery.fetchById(groceryId);
         grocery  = await Grocery.findById(groceryId, Grocery.query1());
         response = Grocery.convertCollectionData(grocery);


      } catch (e) {
        //this will eventually be handled by your error handling middleware
        next(e) 
      }

      console.log(response);

      res.render('pages/grocery-new', {
        name: response.name,
        //elements: response.data, // [data>> department >> ingredient]
        groceryId: groceryId,

        messages: {},

        departments: response.data, // [data>> department >> ingredient]

        title: "Grocery list " + response.name,

        ultimate: ultimateGL
      
      }); 


    });




 router.get('/view/grocery/hidden/:groceryId',
  ensureLoggedIn('/auth/account'),
  function(req, res, next){
    var Grocery   = app.models.Grocery;
    var groceryId = req.params.groceryId;

    // only hidden departments will be diplsayed
    Grocery.fetchById2(groceryId, function(err, response){

      // console.log(response);
      
      // :todo make all data came from method
      res.render('pages/grocery', {
          name: 'Hidden departments of ' + response.name,
          departments: response.data, // [data>> department >> ingredient]
          groceryId: groceryId,
          messages: {},

      });  

    });

  });



  router.get('/auth/attach-grocery-to-user/:groceryId', 
    ensureLoggedIn('/auth/account'), 
    function(req, res, next) {
    var groceryId = req.params.groceryId;
    var userId    = req.user.id;
    var User      = app.models.user;
    var Grocery   = app.models.Grocery;

    // this is a duplicated function from Grocery :todo think about it, real talk   
    var options = {
      userId: userId,
      secondArray: [ groceryId ]
    };
    User.addGrocery(options);
    // User.proceed(options);

    res.redirect('/auth/account');
  });


 
 router.get('/remove/grocery/:groceryId', 
  ensureLoggedIn('/auth/account'), 
  groceryController.removeGrocery);



  router.get('/clone/:groceryId', groceryController.cloneGrocery);





// :todo finish
 router.get('create-new-grocery', 
  ensureLoggedIn('/auth/account'), 
  groceryController.createNewGrocery);

// :todo finish
 router.get('/view/groceries', 
  ensureLoggedIn('/auth/account'), 
  function(req, res, next){
    var userId    = req.user.id;    
    var User      = app.models.user;

    User.methodofAllMethods(userId, function(err, data){
      // console.log(data);
      res.render('pages/grocery-list', {
        title: 'GrocerIES ATTACHED TO THIS USER ' + userId, //:todo update that
        // url: req.url,
        messages: {},
        groceries: data.response,

      }); 

    });

 });

 // Change Grocery Name functionality

 router.get('/change/grocery/name', 
  ensureLoggedIn('/auth/account'), 
  groceryController.changeName);


  // Update grocery list name
  router.post('/update/name', groceryController.postUpdateName);


  app.use(router);

};
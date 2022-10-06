require("dotenv").config();
require("./src/config/passport");
require("./src/config/google");
require("./src/config/local");

// Essentials
const express = require("express");
const session = require('express-session');
const flash = require("express-flash");
const formidable = require('formidable');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const request = require("request");

const uuid = require("uuid");
const bcrypt = require('bcrypt');
const UserService = require("./models/user/index");
const passport = require("passport");
const https = require('https')



// Form Handling with Express
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
 
// Specifying Default Templete
var handlebars = require('express-handlebars')
        .create({ defaultLayout: 'main',
        helpers: {
          section: function(name, options) { 
            if (!this._sections) this._sections = {};
              this._sections[name] = options.fn(this); 
              return null;
            }
        }    
      });
  
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

app.use(express.static(__dirname + "/public"));
app.use(cookieParser());


 
app.use(
  session({
    secret: "secr3t",
    resave: false,
    saveUninitialized: true,
  })
);
 
app.use(flash());
// MiddleWare: 
    // Application MiddleWare Functions |||
        // Disable Response Header from sending sentitive server info
        app.disable('x-powered-by');
 
        app.set('port', process.env.PORT || 3000);
        // module import to our priv lib
        var fortune = require('./lib/fortune.js');
        var octoPrint = require('./lib/octoPrint.js');
        // add flash messages
        app.use(function(req, res, next){
          res.locals.flash = req.session.flash;
          delete req.session.flash;
          next();
        });

    // Routes
        // Showing Home 
    app.get("/", (req, res) => {
        res.render('index', { fortune: fortune.getFortune() } );
    });
    app.get("/landingPage", (req, res) => {
        res.render("landingPage");
      }); 

      // Display Upload
    app.get("/octoPrint/file",function(req, res)
    {
      var now = new Date();
      res.render('octoPrint/file',{
        year: now.getFullYear(), month: now.getMonth()
      });
    }); 

    app.post("/octoPrint/file", function(req,res)
    {
      var KEY = 'EEE76D144F4F43B5A21FC6C7DDB93FE0';
      var OCTOIP = 'http://localhost:5000';
      var form = new formidable.IncomingForm();
      form.parse(req, function(err, fields, files){
        if(err){         
          res.session.flash = {
            type: 'danger',
            intro: 'Oops!',
            message: 'There was Error processing Submission, Pls Try Again...'
          };
          return res.redirect(303, '/octoPrint/file');
        }
        // if Good Upload
        console.log("FIELDS", fields)
        console.log("files", files)
        // if upload success
        req.session.flash = {
          type: 'success',
          intro: 'Good Job!',
          message: 'Upload and Ready for Printing...'
        };
        const form = document.getElementById("form");
        const inputFile = document.getElementById("file");

        const formData = new FormData();

        const handleSubmit = (event) => {
            event.preventDefault();

            for (const file of inputFile.files) {
                formData.append("files", file);
            }

            fetch("http://localhost:5000/api/files/local/test", {
                method: "post",
                body: formData,
            }).catch((error) => ("Something went wrong!", error));
        };

        form.addEventListener("submit", handleSubmit);
        // var options = {
        //   url: OCTOIP + "/api/files/local/test",
        //   port: 5000,
        //   method: "POST",
        //   FormData: {
        //     files
        //   },
        //   headers: {
        //     "Accept": "*/*",
        //       "x-api-key": KEY,
        //       "Content-Type": "multipart/form-data;"
        //   }
        // };  
        // request(options, function(err, res, body){
        //   if(err) console.log(err);
        //   console.log(body)
        // });
        return res.redirect(303, '/landingPage');
    });
  
  })

  app.post("/octoPrint/camera", function(req,res)
  {
    var KEY = 'EEE76D144F4F43B5A21FC6C7DDB93FE0';
    var OCTOIP = 'http://localhost:5000';
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
      if(err){         
        res.session.flash = {
          type: 'danger',
          intro: 'Oops!',
          message: 'There was Error processing Submission, Pls Try Again...'
        };
        return res.redirect(303, '/octoPrint/file');
      }
      // if Good Upload
      console.log("FIELDS", fields)
      console.log("files", files)
      // if upload success
      req.session.flash = {
        type: 'success',
        intro: 'Good Job!',
        message: 'Upload and Ready for Printing...'
      };
      var options = {
        url: OCTOIP + "/api/files",
        port: 5000,
        method: "POST",
        FormData: files,
        headers: {
            "x-api-key": KEY,
            "Content-Type": "multipart/form-data",
            "Content-Length": 100000
        }
      };  
      request(options, function(err, res, body){
        if(err) console.log(err);
        console.log(body)
      });
      return res.redirect(303, '/landingPage');
  });

})


    app.use(passport.initialize());
    app.use(passport.session()); 
        
    // Google Login 
    app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
    })
    );

    app.get(
    "/auth/google/callback", 
    passport.authenticate("google", {
        failureRedirect: "/",
        successRedirect: "/profile",
        failureFlash: true,
        successFlash: "Successfully logged in!",
    })
    );

    const isLoggedIn = (req, res, next) => {
        req.user ? next() : res.sendStatus(401);
      };
      
      app.get("/profile", isLoggedIn, (req, res) => {
        res.render("profile.ejs", { user: req.user });
      });

      app.get("/auth/logout", (req, res) => {
        req.flash("success", "Successfully logged out");
        req.session.destroy(function () {
          res.clearCookie("connect.sid");
          res.redirect("/");
        });
      }); 

      app.get("/local/signup", (req, res) => {
        res.render("local/signup.ejs");
      });
      
      app.get("/local/signin", (req, res) => {
        res.render("local/signin.ejs");
      });
      
    app.post('/auth/local/signin',
      passport.authenticate('local', {
        successRedirect: '/profile',
        failureRedirect: '/local/signin',
        failureFlash: true
      })
    );

    // Showing register form
    app.post("/auth/local/signup", async (req, res) => {
        const { first_name, last_name, email, password } = req.body
        
        if (password.length < 8) {
            req.flash("error", "Account not created. Password must be 7+ characters long");
            return res.redirect("/local/signup");
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        
        try {
            await UserService.addLocalUser({
            id: uuid.v4(),
            email,
            firstName: first_name,
            lastName: last_name,
            password: hashedPassword
            })
        } catch (e) {
            req.flash("error", "Error creating a new account. Try a different login method.");
            return res.redirect("/local/signup")
        }
        
        return res.redirect("/local/signin")
        });
          

    // Error Handling
    // custom 404 page
    app.use(function(req, res){
        res.type('text/plain');
        res.status(404);
        res.send('404 - Not Found');
    });

    // custom 500 page
    app.use(function(err, req, res, next){
        console.error(err.stack);
        res.type('text/plain');
        res.status(500);
        res.send('500 - Server Error');
    });

// Start Database
const mongoose = require('mongoose')

const db = 'mongodb://localhost:27017/auth'
mongoose.connect(
  db,
  {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true
  },
  (error) => {
    if (error) console.log(error) 
  }
)

// Start Server on Port 3000 over HTTPS 
var fs = require('fs');
var options = {
        // OpenSSL Self-Made Certificate (For Simulation Purpose Only)
        key: fs.readFileSync(__dirname + '/ssl/meadowlark.pem'),
        cert: fs.readFileSync(__dirname + '/ssl/meadowlark.crt'),
};


const PORT = app.get('port')
https.createServer(options, app).listen(app.get('port'), function(){
        console.log('Express started in ' + app.get('env') +
                ' mode on port ' + app.get('port') + ' using HTTPS.', `Server Running on Port: https://localhost:${PORT}`);
});   
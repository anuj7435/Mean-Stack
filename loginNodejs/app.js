var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
//var mysql = require('mysql');
//var popup = require('popups');
var MongoClient =    require('mongodb').MongoClient;


var index = require('./routes/index');
var register = require('./routes/register');
var login = require('./routes/login');
var welcome = require('./routes/welcome');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/register', register);
app.use('/login', login);
app.use('/welcome', welcome);

var url = "mongodb://localhost:27017/node-auth";
// var connection = mysql.createConnection({
//     host       : 'localhost',
//     user       : 'root',
//     password   : 'root',
//     database   : 'node',
//     port       : '3306'
// });
//
// connection.connect();

console.log('Listening ......');


app.get('/', function(req,res){
  res.sendFile(path.join(__dirname + '/index.ejs'));


});
app.get('/', function(req, res){
  res.sendFile(path.join(__dirname + '/register.ejs'));
});

app.post('/register', function(req, res) {
    var fname = req.body.fname;
    var lname = req.body.lname;
    var email = req.body.email;
    var altEmail = req.body.altEmail;
    var password = req.body.password;
    var mobile = req.body.mobile;
    var dob = req.body.dob;
    var toc = new Date();

    MongoClient.connect(url, function (err, result) {
        if (err)
            throw err;

        var dbHandle = result.db('node-auth');

        dbHandle.collection('registrations').findOne({email: email}, function (err, resul) {
            if (err)
                throw err;

            var q = resul;
            if (q === null) {
                var entry = {
                    firstName: fname,
                    lastName: lname,
                    email: email,
                    altEmail: altEmail,
                    password: password,
                    mobileNo: mobile,
                    dateOfBirth: dob,
                    timeOfCreation: toc
                };
                dbHandle.collection('registrations').insertOne(entry, function (err, result) {
                    if (err)
                        throw(err);
                    console.log('1 entry registered');
                    res.send('<h1>Registration Successful</h1>' + '<h1>please proceed to <a href="/login">login</a> page </h1>');
                });
            }else{
                res.redirect('back');
            }
        });
    });
});
    // connection.query("select email from registrations where email = ?",[email], function (err, result) {
    //     if(err)
    //         throw err;
    //
    //     var q = result.length;
    //
    //     if(q === 0){
    //     //if(query.length === 0){
    //         connection.query("insert into registrations (fname,lname,email,altEmail,password,mobile,dob,toc) VALUES (?,?,?,?,?,?,?,?)", [fname.toString(), lname.toString(), email.toString(), altEmail.toString(), password.toString(), mobile.toString(), dob.toString(), toc.toString()], function (err, result) {
    //             if (err) throw err;
    //             console.log('registration successful');
    //             res.send('<h1>Registration Successful</h1>' + '<h1>please proceed to <a href="/login">login</a> page </h1>');
    //         });
    //     }else{
    //         res.redirect('back');
    //     }
    // });
    // });
           app.get('/', function (req, res) {
               res.sendFile(path.join(__dirname + '/login.ejs'));

           });

           app.post('/login', function (req, res) {
               var loginEmail = req.body.loginEmail;
               var loginPassword = req.body.loginPassword;


               MongoClient.connect(url, function (err, result) {
                   if (err)
                       throw err;
                   var dbHandle = result.db('node-auth');
                   dbHandle.collection('registrations').findOne({email: loginEmail}, function (err, logRes) {
                       if (err)
                           throw err;

                       var q = logRes;
                       if (q === null) {
                           res.redirect('back');
                       } else {
                           if (logRes.password === loginPassword) {
                               //res.send('<h1>Welcome to our application</h1>' + '<p><a href="/index">Logout</a></p>');
                               res.sendFile(path.join(__dirname + '/views/welcome.html'));
                           } else {
                               res.redirect('back');
                           }
                       }
                   });

               });

               // connection.query("select password from registrations where email = '" + loginEmail + "'", function (err, rows, fields) {
               //     if (err)
               //         throw err;
               //     if (rows[0].password === loginPassword) {
               //         //res.send('<h1>Welcome to our application</h1>'+'<p><a href="/index">Logout</a></p>');
               //         res.sendFile(path.join(__dirname + '/views/welcome.html'));
               //
               //     }
               //     else {
               //         res.send('<h1>Incorrect Password</h1>' + '<p><a href="/login">Return to login</a></a></p>');
               //     }
               //
               // });
           });

// catch 404 and forward to error handler
           app.use(function (req, res, next) {
               var err = new Error('Not Found');
               err.status = 404;
               next(err);
           });

// error handler
           app.use(function (err, req, res, next) {
               // set locals, only providing error in development
               res.locals.message = err.message;
               res.locals.error = req.app.get('env') === 'development' ? err : {};

               // render the error page
               res.status(err.status || 500);
               res.render('error');
           });
module.exports = app;

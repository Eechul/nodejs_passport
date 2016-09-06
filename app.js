var express = require('express'),
 passport = require('passport'),
 session = require('express-session'),
 NaverStrategy = require('passport-naver').Strategy,
 FacebookStrategy = require('passport-facebook').Strategy;

// @todo Use single `var` keyword?
var client_id = '4B5kNubWm6oWm2WSisiV';
var client_secret = '3nb74bGcbp';
var callback_url = 'http://127.0.0.1:5000/auth/naver';

passport.serializeUser(function(user, done) {
    console.log("1");
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log("2");
	done(null, obj);
});

passport.use(new NaverStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: callback_url
	// @todo Suggest to use `state` parameter?
}, function(accessToken, refreshToken, profile, done) {
	process.nextTick(function () {
		// @todo Remove necessary comment
		//console.log("profile=");
		//console.log(profile);
		// data to be saved in DB
		user = {
            provider: 'naver',
            id : profile._json.id,
			name: profile.displayName,
			email: profile.emails[0].value,
			username: profile.displayName,
			naver: profile._json
		};
		//console.log("user=");
		console.log(profile);
        console.log("3");
		return done(null, user);
	});
}));

passport.use(new FacebookStrategy({
    clientID: 184229931975831,
    clientSecret: "a7bd585609e6f42f289a45ad9e8671da",
    callbackURL: "http://127.0.0.1:5000/auth/facebook"
  },
  function(accessToken, refreshToken, profile, done) {
      console.log(profile);

      user = {
          provider: 'facebook',
          id : profile.id,
          name: profile.displayName,
          //email: profile.emails[0].value,
          facebook: profile._json
      };
      return done(null, user);
  }
));

var app = express();

app.use(session(
    {
        secret: 'keyboard cat',
        resave : false,
        saveUninitialized : true
    }));
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'jade');
app.set('views', __dirname + '/views/');
app.use(express.static('public'));

app.get('/', function(req, res){
    console.log("4");
	res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res) {
	console.log(req.user);
	res.render('account', { user: req.user });
});

app.get('/login', function(req, res){
    console.log("5");
	res.render('login', { user: req.user });
});

// Setting the naver oauth routes
app.get('/auth/naver',
	passport.authenticate('naver', null), function(req, res) { // @todo Additional handler is necessary. Remove?
        console.log("6");
        res.redirect("/");
    	console.log('/auth/naver failed, stopped');

    });
// app.get('/auth/facebook',
//   passport.authenticate('facebook'));

app.get('/auth/facebook',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

// creates an account if no account of the new user
// app.get('/auth/naver/callback',
// 	passport.authenticate('naver', {
//         failureRedirect: '#!/auth/login'
//     }), function(req, res) {
//         console.log("7");
//     	res.redirect('/');
//     });

app.get('/logout', function(req, res){
	req.logout();
	res.redirect('/');
});

app.listen(5000);

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) { return next(); }
	res.redirect('/login');
}

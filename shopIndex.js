import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import session from "express-session";
import bcrypt from "bcrypt";
import { Strategy } from "passport-local";
import passport from "passport";
import env from "dotenv";

const app = express();
const port = 3000;
const saltRounds = 6;
env.config();

const year = new Date().getFullYear();


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    },
}));

app.use(passport.initialize());
app.use(passport.session());


const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

db.connect();

app.get("/", (req, res) => {
    res.render("shopIndex.ejs", {year: year});
});

app.get("/login", (req, res) => {
    res.render("login.ejs", {year: year});
});

app.post("/login", (req, res) => {
    passport.authenticate("local",
        (err, user, options) => {
          if (user) {
            const userId = user.id;
            const email = user.email;
            const username = email.split("@")[0];
            req.session.isLoggedIn = true;
            if (req.body.remember === "on") {
                setTimeout(() => {
                    res.redirect(`/user-page-${userId}/${username}`);
                }, 1000);
            } else {
                req.session.cookie.maxAge = 1000;
                        setTimeout(() => {
                            res.redirect(`/user-page-${userId}/${username}`);
                        }, 1000);
                    }
        } else {
            if (options.message === "Wrong password") {
                res.render("login.ejs", { passwordMessage: options.message});
            } else {
                res.render("login.ejs", { message: options.message});
            };
            
          };
    })(req, res)
  });

passport.use(new Strategy ({usernameField: "email", passwordField: "password"}, async function verify(email, password, cb) {
    try {
        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        
        if (checkResult.rows.length > 0) {
            const user = checkResult.rows[0]; 
            const storedHashedPassword = user.password;
            bcrypt.compare(password, storedHashedPassword, (err, result) => {
                if (err) {
                    return cb(err)
                } else {
                    if (result) {
                        return cb(null, user)
                    } else {
                        return cb(null, false, {message : "Wrong password"});
                    }
                }
            })
            
        } else {
            return cb(null, false, {message : "User with this email does not exist"});
        }
            
        
      } catch (err) {
        console.log("error");
        return cb(err)
      }
}));


app.get("/logout", (req, res) => {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });


app.get("/register", (req, res) => {
    res.render("register.ejs",  {year: year});
});

app.post("/register", async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const repPassword = req.body["rep-password"];
    let passwordMessage = "";
    

   
  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email,]);
    if (checkResult.rows.length > 0) {
        let message = "User with this email already exists";
      res.render("register.ejs", {message: message});
    } else if (checkRegisterPassword(password, repPassword)[0] == false) {
        passwordMessage = checkRegisterPassword(password, repPassword)[1];
        res.render("register.ejs", {passwordMessage: passwordMessage});
    }
    
    else {
        bcrypt.hash(password, saltRounds, async (err, hash) => {
            if (err) {
                res.send(err);
            } else {
                const result = await db.query(
                    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", 
                    [email, hash]
                );
                setTimeout(() => {
                    const user = result.rows[0];
                    req.login(user, (err) => {
                        res.redirect("/login");
                    }, 1000)});      
                }
            })
        }
    } catch (err) {
        console.log(err);
      }    
});


passport.serializeUser((user, cb) => {
    cb(null, user);
});

passport.deserializeUser((user, cb) => {
    cb(null, user);
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`)
});




function checkRegisterPassword (password, reppeatedPassword) {
    const symbols = "+-()&#%$".split("");
    let symbolsCount = 0;
    const alphabetLowerCase = 'abcdefghijklmnopqrstuvwxyz'.split('');
    let lowerCaseCount = 0;
    const alphabetUpperCase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    let upperCaseCount = 0;
    const numbers  = "1234567890".split("");
    let numbersCount = 0;
    for (var i = 0; i < symbols.length; i++) {
        if (password.includes(symbols[i])) {
            symbolsCount++;
            if (symbolsCount > 0) {
                break;
            }
        } 
    }

    for (var i = 0; i < alphabetLowerCase.length; i++) {
        if (password.includes(alphabetLowerCase[i])) {
            lowerCaseCount++;
            if (lowerCaseCount > 0) {
                break;
            }
        }
    }

    for (var i = 0; i < alphabetUpperCase.length; i++) {
        if (password.includes(alphabetUpperCase[i])) {
            upperCaseCount++;
            if (upperCaseCount > 0) {
                break;
            }
        }
    }

    for (var i = 0; i < numbers.length; i++) {
        if (password.includes(numbers[i])) {
            numbersCount++;
            if (numbersCount > 0) {
                break;
            }
        }
    }


    if (password != reppeatedPassword) {
        let passwordMessage = "Passwords don't match";
        return [false, passwordMessage];
    }
    else if (password.length < 6) {
        let passwordMessage = "Password is too short";
        return [false, passwordMessage];
    }
    else if (password.length > 20) {
        let passwordMessage = "Password is too long";
        return [false, passwordMessage];
    }
    else if (symbolsCount < 1) {
        let passwordMessage = "Password must have at least 1 of these symbols: +, -, (, ), &, #, %, $";
        return [false, passwordMessage];
    }
    else if (lowerCaseCount < 1) {
        let passwordMessage = "Password must contains at least 1 lower cased character";
        return [false, passwordMessage];
    }
    else if (upperCaseCount < 1) {
        let passwordMessage = "Password must contains at least 1 upper cased character";
        return [false, passwordMessage];
    }
    else if (numbersCount < 1) {
        let passwordMessage = "Password must contains at least 1 number";
        return [false, passwordMessage];
    }
    else {
        return true;
    }
    
}







const express = require('express');
const app = express();
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");

const PORT = process.env.PORT || 4000;

app.set("view engine", "ejs");
app.use(express.urlencoded({extended: false}));
app.use(session({secret: 'secret', resave: false, saveUninitialized: false}));
app.use(flash());

app.get('/users/register', (req, res)=>{
    res.render("register");
});

app.get('/users/login', (req, res)=>{
    res.render("login");
});

app.get('/users/main', (req, res)=>{
    res.render("main", {user: req.session.user.name});
});

app.post("/users/register",  async (req,res)=>{
    let {name, email, password, password2} = req.body;

    let errors = [];

    if(!name || !email || !password || !password2){
        errors.push({message: "Please enter all fields"});
    }

    if(password != password2){
        errors.push({message: "Passwords do not match"});
    }

    if(password.length < 8){
        errors.push({message: "Password is too short, it should have at least 8 characters"});
    }

    if(errors.length != 0){
        res.render('register', {errors});
    } else {
        let hashedPassword = await bcrypt.hash(password, 10);
        pool.query(
            `select * from web
            where email = $1`, [email], (err, results)=>{
                if (err){
                    throw err;
                }
                if(results.rows.length != 0){
                    errors.push({message: "Email is already in use"});
                    res.render("register", {errors});
                }
                else{
                    pool.query(
                        `insert into web (name, email, password) 
                        values ($1, $2, $3)
                        returning id, password`, [name, email, hashedPassword], (err, results)=>{
                            if (err){
                                throw err;
                            }
                            req.flash("success_message", "You can login now");
                            res.redirect("/users/login");
                        }
                    );
                }
            }
        );
    }
});


app.post('/users/login', (req, res)=>{
    let {email, password} = req.body;
    let errors = [];
    pool.query(
        `select * from web
        where email = $1`, [email], (err, results)=>{
            if(err) throw err;
            if(results.rows.length != 0){
                const user = results.rows[0];
                bcrypt.compare(password, user.password, (err, isMatch)=>{
                    if(err) throw err;
                    if(isMatch) {
                        req.session.user = {
                            id: user.id,
                            name: user.name,
                            email: user.email
                        };
                        res.redirect("/users/main");
                    }
                    else {
                        req.flash("error", "Wrong Password");
                        res.redirect("/users/login");
                    }
                });
            }
            else{
                req.flash("error", "Email is not registered yet");
                res.redirect("/users/login");
            }
        }
    );
});


app.listen(PORT, ()=>{
    console.log("Server running on port" + PORT);
});
const express=require('express');
const user_data=require('./MOCK_DATA.json');
const path=require('path'); 
const bcrypt=require('bcrypt'); 
const collection=require('./mongodb.js');
const { verify } = require('crypto');
const { channel } = require('diagnostics_channel');
const { name } = require('ejs');
const app=express();
const session = require('express-session');

app.set("view engine","ejs");
app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

const sessionConfig = {
    secret: 'your_strong_secret_key_here', // Replace with a random, cryptographically secure string
    resave: false, // Don't resave session if not modified
    saveUninitialized: true, // Create session when user logs in
    cookie: { secure: false } // Set to true if using HTTPS in production
  };
  
  app.use(session(sessionConfig));


app.get("/data",(req,res)=>{
    // const id = Number(req.params.id);
    // const users= user_data.find((user)=>user.id===id)
    return res.json(user_data);
})

app.get("/login",(req,res)=>{
    res.render("login");
})

app.get("/add_questions",(req,res)=>{
    if (!req.session.loggedIn) {
        return res.redirect('/login');
      }
    
    res.render("add_questions");
})

app.get("/signup",(req,res)=>{
    res.render("signup");
})

app.post("/add_questions",async(req,res)=>{
    const data={
        question:req.body.question,
        option1:req.body.option1,
        option2:req.body.option2,
        option3:req.body.option3,
        option4:req.body.option4,
        answere:req.body.answere,
    }
    const user= await collection.questions.insertMany(data);
    res.render("add_questions");

})
app.get("/home", async (req, res) => {
    if (!req.session.loggedIn) {
        return res.redirect('/login');
      }
    
    // Check if user is logged in before rendering home page
    const questions_data = await collection.questions.find({});
    res.render("home", { questions: questions_data ,session: req.session}); // Pass questions data to the template
  });

app.post('/home', async (req, res) => {
    const { question, option1, option2, option3, option4, answere } = req.body;
    await collection.questions.create({ question, option1, option2, option3, option4, answere});
    res.redirect('/home');
});

app.post('/check-answers', async (req, res) => {
    const { answers } = req.body;
    let correctCount = 0;
    const result = [];

    for (const { questionId, selectedOption } of answers) {
        const question = await collection.questions.findById(questionId);
        const isCorrect = question.answere === selectedOption;
        if (isCorrect) {
            correctCount++;
        }
        result.push({ questionId, isCorrect });
    }

    res.json({ correctCount, answers: result });
});

app.post("/login", async (req, res) => {
    const { name, password } = req.body;
  
    const reg_data = await collection.users.findOne({ name });
    if (!reg_data) {
      return res.send("User not found. Please register first.");
    }
  
    const pass_check = await bcrypt.compare(password, reg_data.password);
    if (pass_check) {
      req.session.loggedIn = true;
      req.session.username = name; // Store username in session for convenience
      res.redirect('/home');
    } else {
      res.send("Invalid login credentials.");
    }
  });
  app.post("/signup", async (req, res) => {
    const { name, password } = req.body;
  
    const reg_data = await collection.users.findOne({ name });
    if (reg_data) {
      return res.send("User already registered.");
    }
  
    const saltround = 10;
    const hashpassword = await bcrypt.hash(password, saltround);
  
    const data = { name, password: hashpassword };
    await collection.users.insertMany(data);
  
    req.session.loggedIn = true; // Optionally log in the user after successful signup
    req.session.username = name;
  
    res.redirect('/home');
  });

  app.get("/logout", (req, res) => {
    req.session.destroy((err) => { // Destroy the session
      if (err) {
        console.error(err); // Handle potential errors
        return res.send("Error logging out!");
      }
      res.redirect('/login'); // Redirect to homepage after logout
    });
  });


app.listen(2000);

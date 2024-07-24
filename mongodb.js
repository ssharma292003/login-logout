const mongoose= require('mongoose');
const connect=mongoose.connect("mongodb://localhost:27017/");

const userSchema =new mongoose.Schema({
    name:{
        require:true,
        type:String
    },
    password:{
        require:true,
        type:String
    }
}
);
const questionschema= new mongoose.Schema({
    question:{
        require:true,
        type:String
    },
    option1:{
        require:true,
        type:String
    },
    option2:{
        require:true,
        type:String
    },
    option3:{
        require:true,
        type:String
    },
    option4:{
        require:true,
        type:String
    },
    answere:{
        require:true,
        type:String
    }
})

const users=mongoose.model('users',userSchema);
const questions=mongoose.model('questions',questionschema);

module.exports={users,questions}
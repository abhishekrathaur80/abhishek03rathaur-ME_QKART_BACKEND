const mongoose = require("mongoose");
// NOTE - "validator" external library and not the custom middleware at src/middlewares/validate.js
const validator = require("validator");
const config = require("../config/config");

const bcrypt = require("bcryptjs");

// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Complete userSchema, a Mongoose schema for "users" collection



const userSchema = mongoose.Schema(

  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {

      type:String,
      required:true,
      trim:true,
      unique:true,
      validate:(value)=>{
        return validator.isEmail(value);
      }
    },
    password: {
      required:true,
      trim:true,
    },
    password: {

      type: String,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            "Password must contain at least one letter and one number"
          );
        }
      },
    },
    walletMoney: {

      type:Number,
      required:true,
      default:500

    },
    address: {
      type: String,
      default: config.default_address,
    },
  },

  // Create createdAt and updatedAt fields automatically


  {
    timestamps: true,
  }
);


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS - Implement the isEmailTaken() static method

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @returns {Promise<boolean>}
 */


//const User =mongoose.model("users" , userSchema);


userSchema.statics.isEmailTaken = async function (email) {
  
  const result= await this.findOne({email:email});
  if(result){
     return true;
  }
  return false;

};

userSchema.pre("save",async function(next){
   const user = this;

  if(user.isModified('password')){
    user.password = await bcrypt.hash(user.password ,10);
  }
next();

})


userSchema.methods.isPasswordMatch= function(password ){
  let user  = this;
return bcrypt.compare(password ,user.password);

}

userSchema.methods.hasSetNonDefaultAddress= async function(){
  const user = this ;
  return user.address !== config.default_address;
}

const User =mongoose.model("users" , userSchema);


// TODO: CRIO_TASK_MODULE_UNDERSTANDING_BASICS



/**
 * Check if entered password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */




/*
 * Create a Mongoose model out of userSchema and export the model as "User"
 * Note: The model should be accessible in a different module when imported like below
 * const User = require("<user.model file path>").User;
 */
/**
 * @typedef User
 */


//const User =mongoose.model("users" , userSchema);

module.exports ={User};


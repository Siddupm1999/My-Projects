import User from '../models/userModel.js'
import validator from 'validator'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';
const TOKEN_EXPIRES = '24h';

const createToken = (userId) => jwt.sign({id:userId},JWT_SECRET,{expiresIn:TOKEN_EXPIRES});

//Register function
export async function registerUser(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
        return res.status(400).json({ success: false, message: "Invalid Email" });
    }

    if (password.length < 8) {
        return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }
    try {
        if (await User.findOne({ email })) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashed});
        const token = createToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                password: user.password
            }
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, message: "Server Error" });
    }
}

//Login Function
export async function loginUser(req,res){
    const {email,password}= req.body;
    if(!email || !password){  
        return res.status(400).json({sucess:false,message:"Email and Password Required"})
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status (401).json({sucess:false,message:"Invalid Credentials."})
        }
        const match = await bcrypt.compare(password,user.password);

        if(!match){
            return res.status (400).json({sucess:false,message:"Invalid Credentials."})
        }
        const token = createToken(user._id);
        res.json({sucess:true,token,user:{id:user._id,name:user.name,email:user.email}})
    }
    catch(err){
        console.log(err);
        res.status(500).json({sucess:fales,message:"Server Error"});
    }
}

//Get Current user
export async function getCurrentUser(req,res){
    try {
        const user =await User.findById(req.user.id).select("name email")
        if(!user){
            return res.status(400).json({sucess:false,message:"User not found"});
        }
        res.json({sucess:true,user})
    } catch(err){
        console.log(err);
        res.status(500).json({sucess:fales,message:"Server Error"});
    }
}

//Update user profile
export async function updateProfile(req,res){
    const{name,email} = req.body;

    if(!name || !email || !validator.isEmail(email)){
        return res.status(400).json({sucess:fales,message:"valid name and email required"}); 
    }
    try {
        const exists = await User.findOne({email,_id:{$ne:req.user.id}});

        if(exists){
            return res.status(409).json({sucess:false,message:"Email already in use by another account."});
        }
        const user = await User.findByIdAndUpdate(
            req.user.id,
            {name,email},
            {new:true, runValidators:true,select:"name,email"}
        ); 
        res.json({sucess:true,user})
    } 
    catch(err){
        console.log(err);
        res.status(500).json({sucess:fales,message:"Server Error"});
    }
}

//Change Passwordn Function
export async function updatePassword(req,res){
    const {currentPassword,newPassword}=req.body;

    if(!currentPassword || !newPassword || newPassword.length < 8){
        return res.json(400).json({sucess: false,message:"Password Invalide or Too short"});
    }
    try {
        const user = await User.findById(res.user.id).select("password");
        if(!user) {
            return res.status(404).json({sucess:false,message:"User not found"})
        } 
        const match = await bcrypt.compare(currentPassword,user.password);
        if(!match){
            return res.staus(401).json({sucess:false,message:"Current password incorrect"});
        }
        user.password = await bcrypt.hash(newPassword,10);
        await user.save();
        res.json({sucess:true,message:"Password Changed"});
    } 
    catch(err){
        console.log(err);
        res.status(500).json({sucess:fales,message:"Server Error"});
    }
}
import bcrypt from 'bcrypt'
import { comparePassword, hashPassword } from '../helpers/passwordHelper.js'
import userModel from '../models/userModel.js'
import JWT from 'jsonwebtoken'

export const registerController = async(req,res) => {
    try {
        const { username, email, password, linkedIn } = req.body
        if(!username) {
            return res.send({
                success: false,
                message: "username is required!"
            })
        }
        if(!email) {
            return res.send({
                success: false,
                message: "email is required!"
            })
        }
        if(!password) {
            return res.send({
                success: false,
                message: "password is required!"
            })
        }
        if(!linkedIn) {
            return res.send({
                success: false,
                message: "linkedIn is required!"
            })
        }
        const existingUsername = await userModel.findOne({username})

        if(existingUsername) {
            return res.status(409).send({
                success: false,
                message: "Username aleardy Exists"
            })
        }

        const hashedPassword = await hashPassword(password)
        const user = await new userModel({username,email,password: hashedPassword,linkedIn}).save()
        res.status(201).send({
            success: true,
            message: "User Created Successfully!",
            user
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Something went wrong in backend",
            err
        })
    }
}

export const loginController = async(req,res) => {
    try {
        const { username, password } = req.body
        // validate 
        if(!username || !password) {
            return res.send(404).send({
                success: false,
                message: "Invalid user or password"
            })
        }

        // check user
        const user = await userModel.findOne({username}) 
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "User not registered"
            })
        }
        const match = await comparePassword(password,user.password)
        if(!match) {
            return res.status(409).send({
                success: false,
                message: "Wrong Password!"
            })
        }

        if(user.reportCount == 3) {
            return res.status(401).send({
                success: false,
                message: "You have been banned temporarily"
            })
        }
        const token = JWT.sign({id: user._id},process.env.JWT_SECRET, {expiresIn: "7d"})
        res.status(200).send({
            success: true,
            message: "Logged In Successfully",
            user: {
                username: user.username,
                email: user.email
            },
            token: token
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Somthing went wrong"
        })
    }
}

export const userProfileController = async(req,res) => {
    try {
        const {username} = req.params

        const user = await userModel.findOne({username})
        if(!user) {
            return res.status(404).send({
                success: false,
                message: "User does not Exists"
            })
        }

        return res.status(200).send({
            success: true,
            user: {
                username: user.username,
                email: user.email,
                department: user.department,
                score: user.score,
                interviewTaken: user.interviewsTaken,
                interviewGiven: user.interviewsGiven,
                linkedIn: user.linkedIn,
            }
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Something went wrong",
            err
        })
    }
}

export const reportUser = async(req,res) => {
    try{
        const { _id } = req.body
        const existingUser = await userModel.findOne({_id})
        if(!existingUser) {
            res.status(404).send({
                success: false,
                message: "User not found"
            })
        }
        await userModel.findByIdAndUpdate(_id,{reportCount: existingUser.reportCount+1})
        res.status(201).send({
            success: true,
            message: "Reported!"
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Something went wrong!"
        })
    }
}

export const updateScoreController = async(req,res) => {
    try{
        const { username, feedbackScore } = req.body
        const user = await userModel.findOne({username: username})
        if(!user) {
            res.status(404).send({
                success: false,
                message: "user does not exists",
                user: user,
                username: username,
                feedbackScore
            })
        }
        await userModel.findByIdAndUpdate(user._id,{score: user.score+feedbackScore})
        res.status(201).send({
            success: true,
            message: "Score Updated Successfully",
            prevUser: user
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Error in updating user Score",
            error: err.message
        })
    }
}

export const updateGivenInterviewsController = async(req,res) => {
    try {
        const {username} = req.body
        const user = await userModel.findOne({username})
        const newGiven = user.interviewsGiven + 1
        await userModel.findByIdAndUpdate(user._id,{interviewsGiven: newGiven})
        const newUser = await userModel.findById(user._id)
        res.status(200).send({
            success: true,
            message: "Updated Given interview",
            prevUser: user,
            newUser
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Error while updating given interviews",
            err
        })
    }
}

export const updateTakenInterviewsController = async(req,res) => {
    try {
        const {username} = req.body
        const user = await userModel.findOne({username})
        const newTaken = user.interviewsTaken + 1;
        await userModel.findByIdAndUpdate(user._id,{interviewsTaken: newTaken})
        const newUser = await userModel.findById(user._id)
        res.status(200).send({
            success: true,
            message: "Updated Taken interview",
            prevUser: user,
            newUser
        })
    }
    catch(err) {
        res.status(500).send({
            success: false,
            message: "Error while updating taken interviews",
            err
        })
    }
}
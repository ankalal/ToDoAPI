var express = require('express')
var router = express.Router()
const User = require("./db/user")
const Token = require("./helper/token")


router.post("/", async (req, res) => {
    try {
        if(req.body.userName && req.body.password){
            const user = await new User({
                userName: req.body.userName,
                password: req.body.password
            }).save();
            res.send({ msg: "User Created", data:{userName:user.userName}, status: "ok" })
        }
        else{
            res.status(401).send({
                msg: "Invalid parametes",
                status: "invalidParametes"
            })
        }
    }
    catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ userName: req.body.userName })
        if(user){
            user.comparePassword(req.body.password, (err, isMatch) => {
                if (err)
                    throw err;
                if (isMatch) {
                    token = Token.create(user._id);
                    res.send({
                        msg: "login successful",
                        data: { userName: user.userName, token }, 
                        status: "ok"
                    })
                }
                else {
                    res.status(400).send({
                        msg: "Invalid Password",
                        status: "invalidPassword"
                    })
                }
            })
        }
        else{
            res.status(400).send({
                msg: "Invalid UserName",
                status: "invalidUserName"
            })
        }
    }
    catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

router.post("/logout",async(req,res)=>{
    try{
        const bearerHeader = req.headers["authorization"];
        if (bearerHeader) {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            Token.remove(bearerToken);
            res.send({
                msg: "Logout successful",
                status: "ok"
            })
        }
        else{
            throw new Error("No Token found")
        }
    }
    catch(e){
        console.log(e)
        res.sendStatus(400)
    }
})

module.exports = router
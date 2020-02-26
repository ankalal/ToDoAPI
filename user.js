var express = require('express')
var router = express.Router()
const User = require("./db/user")
const Token = require("./helper/token")


router.post("/", async (req, res) => {
    try {
        const userName = typeof (req.body.userName) == "string" && req.body.userName.trim().length > 0 ? req.body.userName.trim() : false
        const password = typeof (req.body.password) == "string" && req.body.password.trim().length > 0 ? req.body.password.trim() : false
        if (userName && password) {
            const user = await new User({
                userName: req.body.userName,
                password: req.body.password
            }).save();
            res.send({ msg: "User Created", data: { userName: user.userName }, status: "ok" })
        }
        else {
            res.send({
                msg: "Invalid parameters",
                status: "invalidParam"
            })
        }
    }
    catch (e) {
        if (e.code == "11000") {
            res.send({
                msg: "User Name Already Exist",
                status: "userAlreadyExist"
            })
        }
        else {
            console.log(e)
            res.sendStatus(400)
        }
    }
})

router.post("/login", async (req, res) => {
    try {
        const userName = typeof (req.body.userName) == "string" && req.body.userName.trim().length > 0 ? req.body.userName.trim() : false
        const password = typeof (req.body.password) == "string" && req.body.password.trim().length > 0 ? req.body.password.trim() : false
        if (userName && password) {
            const user = await User.findOne({ userName })
            if (user) {
                user.comparePassword(password, (err, isMatch) => {
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
                        res.send({
                            msg: "Invalid Password",
                            status: "invalidPass"
                        })
                    }
                })
            }
            else {
                res.send({
                    msg: "Invalid UserName",
                    status: "invalidUserName"
                })
            }
        }
        else {
            res.send({
                msg: "Invalid parameters",
                status: "invalidParam"
            })
        }
    }
    catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

router.get("/logout", async (req, res) => {
    try {
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
        else {
            res.send({
                msg: "Auth Token missing",
                status: "tokenMissing"
            })
        }
    }
    catch (e) {
        console.log(e)
        res.sendStatus(400)
    }
})

module.exports = router
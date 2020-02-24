const router = require('express').Router()
const User = require("./db/user")
const Todo = require("./db/todo")
const Token = require("./helper/token")


router.use(async(req, res, next) => {
    try {
        const bearerHeader = req.headers["authorization"];
        if (bearerHeader) {
            const bearer = bearerHeader.split(" ");
            const bearerToken = bearer[1];
            const userId=await Token.check(bearerToken);
            const user = await User.findOne({ _id:userId })
            if(user){
                req.headers.userId = userId
                next()
            }
            else{
                throw new Error("invalid User");
            }
        }
        else {
            res.sendStatus(401);
        }
    }
    catch (e) {
        console.log(e)
        res.sendStatus(401);
    }
})

router.route("/")
    .get(async (req, res) => {
        try {
            const todo = await Todo.find({ userId: req.headers.userId, status: { $ne: "delete" } },
                "name id status createdAt",
                {
                    lean: true,
                    sort: { createdAt: 1 },
                }
            )
            res.send({data:todo,msg:"Todo List",status:"ok"})
        }
        catch (e) {
            console.log(e)
            res.sendStatus(400)
        }
    })
    .post(async (req, res) => {
        try {
            const todo = await new Todo({
                name: req.body.name,
                status: "new",
                userId: req.headers.userId
            }).save()
            res.send({data:{name:todo.name, status:todo.status},msg:"Todo Created",status:"ok"})
        }
        catch (e) {
            console.log(e)
            res.sendStatus(400)
        }
    })

router.route("/:id")
    .put(async (req, res) => {
        try {
            const todo = await Todo.update({ _id: req.params.id, userId: req.headers.userId, status: "new" }, { status: "done" }, { new: true })
            res.send({msg:"Task Completed",status:"ok",data:{name:todo.name, status:todo.status}})
        }
        catch (e) {
            console.log(e)
            res.sendStatus(400)
        }
    })
    .delete(async (req, res) => {
        try {
            const todo = await Todo.update({ _id: req.params.id, userId: req.headers.userId }, { status: "delete" }, { new: true })
            res.send({msg:"Task Deleted",status:"ok",data:{name:todo.name, status:todo.status}})
        }
        catch (e) {
            console.log(e)
            res.sendStatus(400)
        }
    })

module.exports = router
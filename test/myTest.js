require('dotenv').config()
const expect = require('chai').expect;
const Axios = require('axios');
require("../db/mongoose");
const User = require("../db/user")
const ToDo = require("../db/todo")

var axios= Axios.create({
    baseURL: process.env.testUrl,
});


const data = {
    "userName": "testUser",
    "password": "abc"
}
let token = "";
let taskId = "";

describe('User', () => {
    before((done) => {
        User.deleteOne({ userName: data.userName }).then((res) => {
            done()
        })
            .catch(e => {
                done(e)
            })
    });
    describe('User Creation', () => {
        it('Invalid Parameter', (done) => {
            axios.post('/user', {}).then((res) => {
                expect(res.data.status).to.equal('invalidParam');
                done();
            })
                .catch((e) => {
                    done(e)
                })
        })
        it('Create User', (done) => {
            axios.post('/user', data).then((res) => {
                expect(res.data.status).to.equal('ok');
                done();
            })
                .catch((e) => {
                    done(e)
                })
        })
        it('user already exist', (done) => {
            axios.post('/user', data).then((res) => {
                expect(res.data.status).to.equal('userAlreadyExist');
                done();
            })
                .catch((e) => { done(e) })
        })
    });

    describe('User Login', () => {
        it('Invalid Parameters', (done) => {
            axios.post('/user/login', {}).then((res) => {
                expect(res.data.status).to.equal('invalidParam');
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it('Invalid UserName', (done) => {
            axios.post('/user/login', { userName: "test", password: data.password }).then((res) => {
                expect(res.data.status).to.equal('invalidUserName');
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it('Invalid Password', (done) => {
            axios.post('/user/login', { userName: data.userName, password: "abc1" }).then((res) => {
                expect(res.data.status).to.equal('invalidPass');
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it('login Successfull', (done) => {
            axios.post('/user/login', data).then((res) => {
                expect(res.data.status).to.equal('ok');
                token = res.data.data.token
                done();
            })
                .catch((e) => { console.log(e) })
        })
    });

    describe("User Logout", () => {
        it('Invalid Parameters', (done) => {
            axios.get('/user/logout').then((res) => {
                expect(res.data.status).to.equal('tokenMissing');
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it('logout successfull', (done) => {
            let headers = { "authorization": `Bearer ${token}` }
            axios.get('/user/logout', { headers }).then((res) => {
                expect(res.data.status).to.equal('ok');
                token = "";
                done();
            })
                .catch((e) => { console.log(e) })
        })
    })
})

describe("Auth", () => {
    before((done) => {
        axios.post('/user/login', data).then((res) => {
            token = res.data.data.token
            done();
        })
            .catch((e) => { console.log(e) })
    });
    it("No token passed", (done) => {
        axios.get('/todo').then((res) => {
            done();
        })
            .catch((e) => {
                expect(e.response.status).to.equal(401);
                done();
            })
    })
    it("invalid Token", (done) => {
        let headers = { "authorization": `Bearer someRandomToken` }
        axios.get('/todo', { headers }).then((res) => {
            done();
        })
            .catch((e) => {
                done();
            })
    })
    it("Correct Token", (done) => {
        let headers = { "authorization": `Bearer ${token}` }
        axios.get('/todo', { headers }).then((res) => {
            expect(res.data.status).to.equal('ok');
            done();
        })
            .catch((e) => { console.log(e) })
    })
})

describe("ToDo", () => {
    before((done) => {
        axios.post('/user/login', data).then((res) => {
            token = res.data.data.token
            axios.defaults.headers.common['authorization'] = `Bearer ${token}`
            ToDo.deleteMany({}).then((res) => {
                done()
            })
        })
            .catch((e) => { console.log(e) })
    });

    it("empty ToDo List", (done) => {
        axios.get('/todo').then((res) => {
            expect(res.data.status).to.equal('ok');
            expect(res.data.data.length).to.equal(0)
            done();
        })
            .catch((e) => { console.log(e) })
    })

    describe("Create a TODO task", () => {
        it("Task Name is empty", (done) => {
            axios.post('/todo', {}).then((res) => {
                expect(res.data.status).to.equal('invalidParam');
                done();
            })
                .catch((e) => { console.log(e) })
        })

        it("Add successfull", (done) => {
            axios.post('/todo', { name: "Task Need to be done" }).then((res) => {
                expect(res.data.status).to.equal('ok');
                taskId = res.data.data.id;
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it("need to do the task", (done) => {
            axios.get('/todo').then((res) => {
                expect(res.data.status).to.equal('ok');
                expect(res.data.data.length).to.equal(1)
                expect(res.data.data[0].status).to.equal("new")
                done();
            })
                .catch((e) => { console.log(e) })
        })
    })

    describe("DO the task and remove", () => {
        it("complete the task", (done) => {
            axios.put(`/todo/${taskId}`).then((res) => {
                expect(res.data.status).to.equal('ok');
                expect(res.data.data.status).to.equal("done")
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it("check completed the task", (done) => {
            axios.get(`/todo`).then((res) => {
                expect(res.data.status).to.equal('ok');
                expect(res.data.data[0].status).to.equal("done")
                done();
            })
                .catch((e) => { console.log(e) })
        })
        it("remove Task", (done) => {
            axios.delete(`/todo/${taskId}`).then((res) => {
                expect(res.data.status).to.equal('ok');
                expect(res.data.data.status).to.equal("delete")
                done();
            })
                .catch((e) => { console.log(e) })
        })

        it("All Task Done", (done) => {
            axios.get(`/todo`).then((res) => {
                expect(res.data.status).to.equal('ok');
                expect(res.data.data.length).to.equal(0)
                done();
            })
                .catch((e) => { console.log(e) })
        })
    })
})






const jwt = require('jsonwebtoken');
let token=[]
const encript_string='this is me';

const Token={
    create:(id)=>{
        jwtToken=jwt.sign({id}, encript_string, {
            expiresIn : 60*60*24
        });
        token.push(jwtToken)
        return jwtToken;
    },

    remove:(jwtToken)=>{
        const index=token.indexOf(jwtToken)
        if(index>-1){
            token.splice(index,1)
        }
    },

    check:(jwtToken)=>{
        const index=token.indexOf(jwtToken)
        if(index>-1){
            return new Promise((resolve,reject)=>{
                jwt.verify(jwtToken, encript_string , function(err, data) {
                    if (err) {
                        reject(err);
                     } 
                    else {
                        resolve(data.id)
                    }
                });
            })
        }
        else{
            throw new Error("Token does not exist")
        }
    }
}

module.exports =Token;
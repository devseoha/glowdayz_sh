let users = require('express').Router();
let resResult = require('../common/resResult');
let User = require('../service/user.svc');
const Joi = require('joi');

/*
    - 요구사항 
    1. 유저는 자신만의 폴더를 생성 할 수 있다.
        1) 생성시 폴더에 대한 이름을 정할 수 있다.
        2) 폴더의 생성 수는 제한이 없다.

*/
users.post('/uploadPhoto/insertFolder', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required(),
        folder_name : Joi.string().min(1).max(255).required()
    });

    let {error, value} = schema.validate(req.body);
    
    if(error) return res.status(400).send(resResult(400,false,"파라미터의 유효성을 확인해주세요.",error.message));

    try{
        let result = await User.insertFolder(value);
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});

module.exports = users;
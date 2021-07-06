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

/*
    - 요구사항 
    2. 유저는 자신의 특정 폴더에 업로드된 사진을 저장할 수 있다. 
        1) 사진은 어딘가의 이미지 서버에 저장이 되고 이에 대한 url이 저장된다고 가정한다.
        2) n개의 사진을 동시에 저장할 수 있다. 
*/
users.post('/uploadPhoto/insertFile', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required(),
        folder_id : Joi.number().required(),
        url : Joi.array().items(
            Joi.string().max(1023)
        ).required()
    });

    let {error, value} = schema.validate(req.body);
    
    if(error) return res.status(400).send(resResult(400,false,"파라미터의 유효성을 확인해주세요.",error.message));

    try{
        let result = await User.insertFile(value);
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});

/*
    - 요구사항 
    3. 유저는 자신의 폴더를 생성된 순서대로 조회할 수 있으며, 이때에 각 폴더에 저장된 이미지 갯수를 알 수 있다. 
*/
users.post('/uploadPhoto/selectFolder', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required()
    });

    let {error, value} = schema.validate(req.body);
    
    if(error) return res.status(400).send(resResult(400,false,"파라미터의 유효성을 확인해주세요.",error.message));

    try{
        let result = await User.selectFolder(value);
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});

/*
    - 요구사항 
    4. 유저는 특정 폴더에서 최근 저장한 순서대로 사진을 조회할 수 있다.
*/
users.post('/uploadPhoto/selectFile', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required(),
        folder_id : Joi.number().required()
    });

    let {error, value} = schema.validate(req.body);
    
    if(error) return res.status(400).send(resResult(400,false,"파라미터의 유효성을 확인해주세요.",error.message));

    try{
        let result = await User.selectFile(value);
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});


module.exports = users;
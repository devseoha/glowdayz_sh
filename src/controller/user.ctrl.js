let users = require('express').Router();
let resResult = require('../common/resResult');
let User = require('../service/user.svc');
const Joi = require('joi');

/*
    - 요구사항 
    1-1. 유저는 자신만의 폴더를 생성 할 수 있다.
        1) 생성시 폴더에 대한 이름을 정할 수 있다.
        2) 폴더의 생성 수는 제한이 없다.
    3-1. 유저는 포인트를 갖게된다.
    3-2. 폴더 생성 시 마다 해당 유저는 1,000 포인트를 획득한다.
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
    1-2. 유저는 자신의 특정 폴더에 업로드된 사진을 저장할 수 있다. 
        1) 사진은 어딘가의 이미지 서버에 저장이 되고 이에 대한 url이 저장된다고 가정한다.
        2) n개의 사진을 동시에 저장할 수 있다. 
    2-1. 사진 저장 시 n개의 문자 태그를 추가로 전달받아 저장해야 한다.
    3-3. 사진 업로드 시 해당 유저는 사진 1개당 100 포인트를 소모한다.
    3-4. 포인트가 모자란 경우 사진을 업로드 할 수 없다.
*/
users.post('/uploadPhoto/insertFile', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required(),
        folder_id : Joi.number().required(),
        list : Joi.array().items(
            Joi.object({
                url : Joi.string().required(),
                tags : Joi.array().items(
                    Joi.string().max(1023)
                )
            })
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
    1-3. 유저는 자신의 폴더를 생성된 순서대로 조회할 수 있으며, 이때에 각 폴더에 저장된 이미지 갯수를 알 수 있다. 
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
    1-4. 유저는 특정 폴더에서 최근 저장한 순서대로 사진을 조회할 수 있다.
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

/*
    - 요구사항 
    2-2. 통계를 위해 전체 ㅏ진에서 가장 많이 달린 태그에 대한 top 10을 추출할 수 있어야 한다.
*/
users.post('/uploadPhoto/selectFileTag', async(req,res) => {
    try{
        let result = await User.selectFileTag();
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});
/*
    - 요구사항 
    4-1. 포인트에 대한 선입선출
        1) 유저가 폴더를 2개 생성하여 2,000포인트를 획득한다.
        2) 유저가 1개의 사진을 폴더 2에 저장하여 100포인트를 소모한다(사진이 저장되는 폴더와 선입/선출은 관계가 없다.)
        3) 이때, 폴더 1은 생성으로 인한 포인트 획득량 1000 초인트에서, 100 포인트가 소모됐음을 알 수 있어야 한다.
        4) 폴더2는 생성으로 인한 포인트 획득량 1000포인트에서 포인트 소모가 없었음을 알 수 있어야 한다.
        5) 사진을 추가로 10장을 저장하면, 다음과 같은 상태가 됨을 알 수 있어야 한다.
         * 폴더 1  
            - 포인트획득 : 1000
            - 포인트소모 : 1000
           폴더 2
            - 포인트획득 : 1000
            - 포인트소모 : 100
*/
users.post('/point/selectPointHistory', async(req,res) => {
    let schema = Joi.object({
        user_id : Joi.number().required()
    });

    let {error, value} = schema.validate(req.body);
    
    if(error) return res.status(400).send(resResult(400,false,"파라미터의 유효성을 확인해주세요.",error.message));

    try{
        let result = await User.selectPointHistory(value);
        return res.status(result.code).send(result);
    } catch (err) {
        console.log(err);
        return res.status(500).send(resResult(false,500,"서버와 통신이 불가능합니다.",err));
    }
});

module.exports = users;
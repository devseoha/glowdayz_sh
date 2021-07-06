var express = require('express');
var resResult = require('../common/resResult');
const Sequelize = require('sequelize');
var db = require('../../models/index.js');

const findUser = async(user_id)=>{
    let result = await db.user.findOne({
        where : {
            id : user_id
        }
    });
    return result;
};

exports.insertFolder = async({user_id, folder_name}) => {
    let result;

    try{
        if(!await findUser(user_id)) return resResult(false,400,"요청 결과 반환","유저 아이디를 확인해주세요.");

        await db.photo_folder.create({
            user_id : user_id,
            name : folder_name
        }).then(async(data)=>{
            result = data.dataValues;
        });
        
        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};
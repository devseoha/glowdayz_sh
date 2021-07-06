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

const checkUserFolder = async(user_id,folder_id)=>{
    let result = await db.photo_folder.findOne({
        where : {
            id : folder_id,
            user_id : user_id
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

exports.insertFile = async({user_id, folder_id, url}) => {
    let result;
    try{
        if(!await findUser(user_id)) return resResult(false,400,"요청 결과 반환","유저 아이디를 확인해주세요.");
        
        if(!await checkUserFolder(user_id, folder_id)) return resResult(false,400,"요청 결과 반환","유저/폴더 아이디를 확인해주세요.");

        let obj = new Object();
        let list = url.map((data)=>{
            obj = {};
            obj.folder_id = folder_id;
            obj.url = data;
            return obj;
        });

        await db.photo_file.bulkCreate(list).then((data)=>{
            result = data;
        });

        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};
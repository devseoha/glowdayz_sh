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

const savePoint = async(user_id,folder_id)=>{
    let obj = resResult;
    try{
        await db.sequelize.query(
            `UPDATE user
            SET point = user.point + 1000 , updated_at = now() 
            WHERE 1=1
            AND id = :user_id
            `           
            ,
            { replacements: { user_id:user_id}, type: Sequelize.QueryTypes.UPDATE }
        ).then(async(data)=>{
            if(data){
                try{
                    await db.point_history.create({
                        user_id : user_id,
                        folder_id : folder_id,
                        increase : 1000
                    }).then(async(data2)=>{
                        obj = resResult(true,200,"요청 결과 반환",data2);
                    })
                }catch(err){
                    await db.sequelize.query(
                        `UPDATE user
                        SET point = user.point - 1000 , updated_at = now() 
                        WHERE 1=1
                        AND id = :user_id
                        `           
                        ,
                        { replacements: { user_id:user_id}, type: Sequelize.QueryTypes.UPDATE }
                    )
                    obj = resResult(false,400,"요청 결과 반환","포인트 히스토리 오류");
                    
                }
            };
        });
        
        return obj;
    }catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
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
        
        let check_point = await savePoint(user_id, result.id);

        if(!check_point.status) return resResult(false,400,"요청 결과 반환","포인트적립에서 에러 발생.");
        
        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

exports.insertFile = async({user_id, folder_id, list}) => {
    let result;
    try{
        if(!await findUser(user_id)) return resResult(false,400,"요청 결과 반환","유저 아이디를 확인해주세요.");
        
        if(!await checkUserFolder(user_id, folder_id)) return resResult(false,400,"요청 결과 반환","유저/폴더 아이디를 확인해주세요.");

        for(let i=0; i<list.length;i++){
            await db.photo_file.create({
                user_id : user_id,
                folder_id : folder_id,
                url:list[i].url
            }).then(async(data)=>{
                let file_id = data.dataValues.id;
                for(let j=0; j<list[i].tags.length;j++){
                    await db.photo_file_tag.create({
                        file_id : file_id,
                        name : list[i].tags[j]
                    });
                };
            });
        };

        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

exports.selectFolder = async({user_id}) => {
    let result;
    try{
        if(!await findUser(user_id)) return resResult(false,400,"요청 결과 반환","유저 아이디를 확인해주세요.");
        
        result = await db.sequelize.query(
            `SELECT 
                pfi.folder_id, pfo.name, count(*) as cnt
             FROM user
             JOIN photo_folder pfo
             ON user.id = pfo.user_id
             JOIN photo_file pfi
             ON pfo.id = pfi.folder_id
             WHERE 1=1
             AND user.id = :user_id
             GROUP BY pfi.folder_id
             ORDER BY pfo.created_at ASC 
            `           
            ,
            { replacements: { user_id:user_id}, type: Sequelize.QueryTypes.SELECT }
        );

        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

exports.selectFile = async({user_id, folder_id}) => {
    let result;
    try{
        if(!await findUser(user_id)) return resResult(false,400,"요청 결과 반환","유저 아이디를 확인해주세요.");

        if(!await checkUserFolder(user_id, folder_id)) return resResult(false,400,"요청 결과 반환","유저/폴더 아이디를 확인해주세요.");
        
        result = await db.sequelize.query(
            `SELECT 
                pfi.folder_id, pfo.name, pfi.url, DATE_FORMAT(pfi.created_at, '%Y-%m-%d %H:%i') AS CREATE_ 
             FROM user
             JOIN photo_folder pfo
             ON user.id = pfo.user_id
             JOIN photo_file pfi
             ON pfo.id = pfi.folder_id
             WHERE 1=1
             AND user.id = :user_id
             AND pfo.id = :folder_id
             ORDER BY pfi.created_at DESC
            `           
            ,
            { replacements: { user_id:user_id, folder_id:folder_id}, type: Sequelize.QueryTypes.SELECT }
        );

        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

exports.selectFileTag = async() => {
    let result;
    try{
        result = await db.sequelize.query(
            `SELECT
                ft.name, count(*) as cnt
             FROM photo_file_tag ft
             GROUP BY ft.name
             ORDER BY cnt DESC
             LIMIT 10
            `           
            ,
            { replacements: {}, type: Sequelize.QueryTypes.SELECT }
        );

        return resResult(true,200,"요청 결과 반환",result);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};
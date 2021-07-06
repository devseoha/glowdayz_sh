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

const checkPoint = async(user_id)=>{
    try{
        let point = await db.user.findOne({where:{id:user_id}});
       
        if(point.dataValues.point < 100) return resResult(false,400,"요청 결과 반환", "포인트부족");
        
        return resResult(true,200,"요청 결과 반환","저장 가능");
    }catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

const usePoint = async(user_id,file_id)=>{
    let obj = resResult;
    try{
        await db.sequelize.query(
            `UPDATE user
            SET point = user.point - 100 , updated_at = now() 
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
                        file_id : file_id,
                        decrease : 100
                    }).then(async(data2)=>{
                        obj = resResult(true,200,"요청 결과 반환",data2);
                    })
                }catch(err){
                    await db.sequelize.query(
                        `UPDATE user
                        SET point = user.point + 100 , updated_at = now() 
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
            let check_point = await checkPoint(user_id);
            
            if(!check_point.status)return resResult(false,400,"요청 결과 반환",`${i+1}번째 사진을 포인트부족으로 업로드 하지못했습니다.`);

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
                await usePoint(user_id, file_id);
            });
        };

        return resResult(true,200,"요청 결과 반환","포인트 소모, 사진 파일 올리기 성공");
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

exports.selectPointHistory = async({user_id}) => {
    try{
        let result = await db.sequelize.query(
            `SELECT 
                ph.folder_id, pfo.name, ph.increase, decrease.sum
             FROM user
             JOIN point_history ph
             ON user.id = ph.user_id
             JOIN photo_folder pfo
             ON ph.folder_id = pfo.id 
             JOIN (SELECT sum(ph.decrease) as sum
                    FROM user
                    JOIN point_history ph
                    ON user.id = ph.user_id
                    WHERE 1=1
                    AND user.id = 1
                    AND ph.file_id is not NULL) decrease
             WHERE 1=1
             AND user.id = :user_id
             AND ph.folder_id IS NOT NULL
             GROUP BY ph.folder_id
             ORDER BY ph.folder_id ASC
            `           
            ,
            { replacements: {user_id:user_id}, type: Sequelize.QueryTypes.SELECT }
        );
        
        let arr = new Array();
        let obj = new Object();
        let sum = result[0].sum;

        for(let i=0; i<result.length;i++){
            obj = {};
            obj.folder_id = result[i].folder_id;
            obj.name = result[i].name;
            obj.increase = 1000;

            if(sum>=1000){
                obj.decrease = 1000;
                sum -= 1000;
            }else if(sum < 1000){
                obj.decrease = sum;
                sum = 0;
            }else if(sum==0){
                obj.decrease = sum;
            }
            arr.push(obj);
        };

        return resResult(true,200,"요청 결과 반환",arr);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

exports.selectEmptyPointHistory = async({user_id}) => {
    try{
        let result = await db.sequelize.query(
            `SELECT 
                ph.folder_id, pfo.name, ph.increase, decrease.sum
             FROM user
             JOIN point_history ph
             ON user.id = ph.user_id
             JOIN photo_folder pfo
             ON ph.folder_id = pfo.id 
             JOIN (SELECT sum(ph.decrease) as sum
                    FROM user
                    JOIN point_history ph
                    ON user.id = ph.user_id
                    WHERE 1=1
                    AND user.id = 1
                    AND ph.file_id is not NULL) decrease
             WHERE 1=1
             AND user.id = :user_id
             AND ph.folder_id IS NOT NULL
             GROUP BY ph.folder_id
             ORDER BY ph.folder_id ASC
            `           
            ,
            { replacements: {user_id:user_id}, type: Sequelize.QueryTypes.SELECT }
        );

        let arr = new Array();
        let obj = new Object();
        for(let i=Math.ceil(result[0].sum/1000); i<result.length;i++){
            obj={};
            obj.folder_id = result[i].folder_id;
            obj.name = result[i].name;
            arr.push(obj);
        };

        return resResult(true,200,"요청 결과 반환",arr);
    } catch (err) {
        console.log(err);
        return resResult(false,400,"요청 결과 반환",err);
    }
};

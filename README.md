# glowdayz 백엔드 온라인전형 과제제출 / 강서하

## DB정보
* mysql  덤프파일 첨부드리니 확인 바랍니다.
* aws rds 생성하여 바로 확인해 보실 수 있습니다. \
  7월동안 열어둘예정이니 편하게 확인해 보실 수 있습니다. \
  rds정보는 config.json 확인부탁드립니다.

## 사용한 모듈 
 * `mysql2` `pm2` `sequelize` `joi`

## 구조
 * express의 기본구조에서 routers파일을 src로 변경하여 구조를 수정하였습니다. \
 src/common : return 템플릿등 공통으로 사용될 파일을 저장합니다. \
 src/controller : 라우터에서 분기하여 들어온 요청의 파라미터의 값을 검증합니다. \
 src/routers : 기능별 분기점을 만들어주는 역할을 합니다. \
 src/service : 라우터,컨트롤러를 통해 들어온 요청의 실질적인 데이터베이스요청과 데이터가공을 하는 곳 입니다.\
 
## api명세서
1. `post` /user/insertUser 
    * 기능 : 테스트 시 유저계정 생성하는 api
    * 파라미터 
      - name (string) : 유저 이름 

    * 예제

      ```
      {
        "name":"이름"
      }
      ```

2. `post` /user/uploadPhoto/insertFolder 
    * 기능 : 폴더생성, 포인트 적립 히스토리를 남기는 api
    * 파라미터 
      - user_id (int) : 유저 기본키 
      - folder_name (string) : 폴더 생성시 원하는 폴더이름기입

    * 예제

      ```
      {
        "user_id": 1,
        "folder_name":"2021사진첩"
      }
      ```

3. `post` /user/uploadPhoto/insertFile 
    * 기능 : 특정 폴더에 업로드할사진n개, 태그 n개를 저장할수있고 포인트 차감과 함께 포인트 히스토리를 남기는 api
    * 파라미터 
      - user_id (int) : 유저 기본키 
      - folder_id (int) : 업로드할 폴더의 기본키
      - list (array) : 오브젝트 내에 url과 n개의 태그네임

    * 예제

      ```
      {
        "user_id": 1,
        "folder_id":49, 
        "list": [
          {
            "url":"url1",
            "tags":["tag1-1","tag1-2"]
          },
          {
            "url":"url2",
            "tags":["tag2-1","tag2-2"]
          }
        ]
      }
      ```
     
4. `post` /user/uploadPhoto/selectFolder 
    * 기능 : 본인이 생성한 폴더의 순서대로 조회, 각 폴터데 저장된 이미지 갯수도 함께 불러오는 api
    * 파라미터 
      - user_id (int) : 유저 기본키 

    * 예제

      ```
      {
        "user_id": 1
      }
      ```
      
5. `post` /user/uploadPhoto/selectFile
    * 기능 : 특정 폴더의 최근 저장한 순서대로 사진을 조회하는 api 
    * 파라미터 
      - user_id (int) : 유저 기본키 
      - folder_id (int) : 조회할 폴더의 기본키

    * 예제

      ```
      {
        "user_id": 1,
        "forder_id": 49
      }
      ```
      
6. `post` /user/uploadPhoto/selectFileTag
    * 기능 : 전체 사진 중 가장 많이 달린 태그에 대한 top10 추출하는 api
 
7. `post` /user/point/selectPointHistory
    * 기능 : 해당 유저의 포인트히스토리 불러오는 api
    * 파라미터 
      - user_id (int) : 유저 기본키 


    * 예제

      ```
      {
        "user_id": 1
      }
      ```
      
8. `post` /user/point/selectEmptyPointHistory
    * 기능 : 해당 유저의 포인트 소모가 없는 폴더 리스트를 추출하는 api
    * 파라미터 
      - user_id (int) : 유저 기본키 

    * 예제

      ```
      {
        "user_id": 1
      }
      ```
      
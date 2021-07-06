module.exports = function(sequelize, DataTypes){
    var photo_file_tag = sequelize.define("photo_file_tag",{
        id : { field: 'id', type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
        file_id: { field: 'file_id', type: DataTypes.INTEGER(11)},
        name: { field: 'name', type: DataTypes.STRING(255)},
        created_at: { field: 'created_at', type: DataTypes.DATE()},
    }, {
        // don't add the timestamp attributes (updatedAt, createdAt)
        timestamps: false,

        // don't use camelcase for automatically added attributes but underscore style
        // so updatedAt will be updated_at
        underscored: true,

        // disable the modification of tablenames; By default, sequelize will automatically
        // transform all passed model names (first parameter of define) into plural.
        // if you don't want that, set the following
        freezeTableName: true,

        // define the table's name
        tableName: 'photo_file_tag'
    });
    return photo_file_tag;
};


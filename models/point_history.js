module.exports = function(sequelize, DataTypes){
    var point_history = sequelize.define("point_history",{
        id : { field: 'id', type: DataTypes.INTEGER(11), primaryKey: true, autoIncrement: true},
        user_id: { field: 'user_id', type: DataTypes.INTEGER(11)},
        folder_id : { field: 'folder_id', type: DataTypes.INTEGER(11)},
        file_id : { field: 'file_id', type: DataTypes.INTEGER(11)},
        increase : { field: 'increase', type: DataTypes.INTEGER(11)},
        decrease : { field: 'decrease', type: DataTypes.INTEGER(11)},
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
        tableName: 'point_history'
    });
    return point_history;
};


var mysql = require("mysql2");
var dbSetup = {
  host 		: 'localhost',
  database  : 'mtg', 
  user     	: 'mtg', 
  password 	: 'mtg'
};
var connection = mysql.createConnection(dbSetup);

connection.connect();

console.log("DB Connected :: " + dbSetup.database);

module.exports = connection;
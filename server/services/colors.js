var db = require("../database.js");

module.exports = {
	getColors : function (cb) {
		var query = "SELECT id, code, label, rank FROM colors order by rank asc";
		db.query(query, function(err, rows) {
			cb(rows);
		});
	},
	getSetColors : function(setId, cb) {
		var query = "select  a.colors as col, count(a.colors) as cnt" +
		" from ( select " +
		// " GROUP_CONCAT(colors.code SEPARATOR ',') as colors "+
		" GROUP_CONCAT(colors.code order by colors.code SEPARATOR ',') as colors " +
		" from cards LEFT JOIN card_colors on card_colors.`card_id` = cards.id LEFT JOIN colors on colors.id = card_colors.color_id" + 
		" WHERE cards.primary_face is null AND cards.setId = "+ setId +
		" group by cards.id) a group by a.colors" +
		" having cnt <> 0";
		console.log(query);
		db.query(query, function ( err, rows) {
			cb(rows);
		});
	}
}
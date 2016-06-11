var http = require("http");

var utilities = require("./utilities.js");

var colorsService = require("./services/colors.js");
var app = require("./appServer.js");

var connection = require("./database.js");

function responseJson(response) {
	return function(jsonData) {
		response.json(jsonData);
	}
}

app.get("/colors", function(req, resp) {
	colorsService.getColors(responseJson(resp));
	// var query = "SELECT id, code, label, rank FROM colors order by rank asc";
	// connection.query(query, function(err, rows) {
	// 	resp.json(rows);
	// });
});
app.get("/types/:level", function(req, resp) {
	var query = "SELECT id, label, level, rank FROM types WHERE level = '" + req.params.level + "'";
	connection.query(query, function(err, rows) {
		resp.json(rows);
	});
});
/**
	CARDS
**/
app.get("/cards/", function (req, resp) {
	db.cards.find().limit(5).toArray(function(err, results) {
		resp.json(results);
	});
});
app.get("/cards/search", function (req, resp) {
	var c = [];
	var returnSet = [];
	var regex = new RegExp(".*?"+req.query.name,"i");
	console.log(regex);
	db.cards.find({"name" : {$regex: regex}}).toArray(function(err, results) {
		if(!results.length) { resp.json(null);return;}
		for(var i in results) {
			findCount(results[i]);	
		}
		
	});
	function findCount(card) {
		c.push(true);
		db.myCards.findOne({id: card.id}, function (e, result) {
			if(result) {
				card.count = result.count;
			}
			else {
				card.count = 0;
			}
			c.pop();
			returnSet.push(card);
			if(c.length == 0) {
				resp.json(returnSet);				
			}

		});
	}
});

app.get("/cards/:id", function (req, resp) {
	// var q = "SELECT * FROM cards where cards.id = " + req.params.id;
	var q = new fullCardInfoQuey();
	q.where.push("cards.id = " + req.params.id);
	connection.query(q.compile(), function(err, rows) {
		var card = rows[0];
		if(card.secondary_face) {
			var q1 = new fullCardInfoQuey();
			q1.where = ["cards.name="+utilities.valuesOfObjectForMysql([card.secondary_face])[0]];
			console.log(q1);
			connection.query(q1.compile(), function(e, subCards) {
				var subCard = subCards[0];
				card.secondary = subCard;

				resp.json(card);
			})
		}
		else {
			resp.json(card);
		}
	});
});
app.post("/cards/:id/setCount", function (req, resp) {
  	var query = "INSERT INTO myCards (card_id, count) values (" + req.params.id + ", " + req.body.count + ") ";
  		query += "ON DUPLICATE KEY UPDATE count = " + req.body.count;

	connection.query(query, function(err, rows) {
		resp.json({err: err, rows: rows});
	});

});
/**
	SETS	
**/
app.get("/sets/", function (req, resp) {
	connection.query("SELECT * FROM sets ORDER BY releaseDate DESC", function(err, rows) {
		resp.json(rows);
	});
});

app.get("/sets/progress", function (req, resp) {
	var query = "SELECT sets.id as id, sets.name as name, count(DISTINCT cards.id) as total, count(DISTINCT myCards.id) as own, sets.code as code from cards" +
				" LEFT JOIN sets ON sets.id = cards.setId" +
				" LEFT JOIN myCards on myCards.card_id = cards.id" +
				" group by cards.setId";
	connection.query(query, function(err, rows) {
		resp.json(rows);
	});
});
app.get("/sets/:id/colors", function(req, resp) {
	colorsService.getSetColors(req.params.id, responseJson(resp));
});	
app.get("/sets/:id/progress", function(req, resp) {
	var q = "SELECT count(DISTINCT cards.id) as total, count(DISTINCT myCards.id) as own , colors.label as color from cards LEFT JOIN sets ON sets.id = cards.setId LEFT JOIN myCards on myCards.card_id = cards.id LEFT JOIN card_colors on card_colors.card_id = cards.id LEFT JOIN colors on colors.id = card_colors.color_id";
		q += " WHERE cards.setId = " + req.params.id;
		q += " group by colors.label";
	connection.query(q, function(err, rows) {
		resp.json(rows);
	});
});

function fullCardInfoQuey(ops) {
	var columns = [
		"cards.id as id",
		"cards.name as name",
		"cards.cmc as cmc",
		"cards.rarity as rarity",
		"cards.layout as layout",
		"cards.primary_face as primary_face",
		"cards.secondary_face as secondary_face",
		"cards.multiverseid as multiverseid",
		"( select count(*) from card_colors LEFT JOIN colors on colors.id = card_colors.color_id  where card_colors.card_id = cards.id ) as colorCount",
		"( select myCards.count from myCards where myCards.card_id = cards.id ) as count",
		"( select GROUP_CONCAT(colors.code SEPARATOR ',') from card_colors LEFT JOIN colors on colors.id = card_colors.color_id  where card_colors.card_id = cards.id ) as colorCodes",
		"( select GROUP_CONCAT(colors.rank SEPARATOR ',') from card_colors LEFT JOIN colors on colors.id = card_colors.color_id  where card_colors.card_id = cards.id ORDER BY colors.rank ) as colorRanks",
		"( select GROUP_CONCAT(types.label SEPARATOR ',') from card_types LEFT JOIN types on types.id = card_types.type_id AND card_types.type_level = 'SUPER' where card_types.card_id = cards.id  ) as superTypes",
		"( select GROUP_CONCAT(types.rank SEPARATOR ',') from card_types LEFT JOIN types on types.id = card_types.type_id AND card_types.type_level = 'SUPER' where card_types.card_id = cards.id  ) as superTypeRanks",
		"( select GROUP_CONCAT(types.label SEPARATOR ',') from card_types LEFT JOIN types on types.id = card_types.type_id AND card_types.type_level = 'NORMAL' where card_types.card_id = cards.id  ) as normalTypes",
		"( select GROUP_CONCAT(types.rank SEPARATOR ',') from card_types LEFT JOIN types on types.id = card_types.type_id AND card_types.type_level = 'NORMAL' where card_types.card_id = cards.id  ) as normalTypeRanks"
	];
	var where = [
		"(cards.layout = 'normal' OR (cards.layout = 'double-faced' AND cards.primary_face is null) OR cards.layout is null)"
	]
	var having = [];
	
	var orders = [
		"rarity ASC",
		"colorCount",
		"colorRanks",
		"ISNULL(normalTypeRanks)",
		"normalTypeRanks DESC",
		"cmc DESC"
	];

	return {
		where : where,
		orders : orders,
		having : having,
		compile : function() {
			var parts = "select :cols from cards WHERE :where :having";

			parts = parts.replace(":cols", columns.join(", "));
			// parts = parts.replace(":joins", joins.join(" "));
			parts = parts.replace(":where", where.join(" AND "));
			if(having.length) {
				parts = parts.replace(":having", " HAVING " + having.join(" AND "));
			}
			else {
				parts = parts.replace(":having", "");
			}

			parts += " ORDER BY " + orders.join(", ");
			console.log(where, having, orders);
			return parts;
		}
	}
}

app.get("/sets/:id/cards", function (req, resp) {
	
	var color = req.query.color;
	var rarity = req.query.rarity;
	var type = req.query.type;
	var owned = req.query.owned;

	var q = new fullCardInfoQuey();
	q.where.push("setId = " + req.params.id);
	
	if(rarity) {
		q.where.push("rarity in ("+rarity+")");
	}

	if(color) {
		//having colorLabelString LIKE '%Black%' AND colorLabelString LIKE '%RED%' AND  colorCount = 2
		var colors = color.split(",");
		for(var i in colors) {
			q.having.push("colorCodes LIKE '%"+colors[i]+"%'");
		}
		q.having.push("colorCount = " + colors.length);
	}
	if(type) {
		//having colorLabelString LIKE '%Black%' AND colorLabelString LIKE '%RED%' AND  colorCount = 2
		var a = [];
		a.push("superTypes LIKE '%"+type+"%'");
		a.push("normalTypes LIKE '%"+type+"%'");

		q.having.push("(" + a.join(" OR ") + ")");
	}
	if(owned !== undefined) {
		if(owned == "true") {
			q.having.push("count > 0");
		}
		if(owned == "false") {
			q.having.push("(count is null OR count = 0)");
		}
	}

	console.log("=====================");
	console.log(q);
	console.log("=====================");
	connection.query(q.compile(), function(err, rows) {
		resp.json(rows);
	});
});

app.get("/mysql/myCards", function(req, resp) {
	db.myCards.find().toArray(function(err, results) {
		for(var i in results) {
			var cardId = results[i].id;
			var count = results[i].count;
			copyMyCardData(cardId, count);			
		}
		
	});

	function copyMyCardData(cardId, count) {
		connection.query("SELECT * FROM cards WHERE magicId = '"+cardId+"'", function(err, rows, fields) {
			var card_id = rows[0].id;
			connection.query("INSERT INTO myCards (card_id, count) VALUES ("+card_id+","+count+")", function() {
			});
		});	
	}
});

app.get("/mysql/setsAndCards", function(req, resp) {
	var setsJSON = require('../dataSets/soi.json');
	var objects = [];
	for(var i in setsJSON) {
		var set = setsJSON[i];
		var setDBO = {
			dbt: 'sets',
			dbo: {
				name: set.name,
				code: set.code,
				releaseDate: set.releaseDate,
				type : set.type,
				block: set.block
			},
			dependentObjs : [
			]
		}

		for(var j in set.cards) {
			var card = set.cards[j];
			var cardDBO = {
				dbt: 'cards',
				dbo: {
					name: card.name,
					layout: card.layout,
					primary_face : null,
					secondary_face : null,
					textManaCost: card.manaCost,
					cmc : card.cmc == undefined? null : card.cmc,
					type: card.type,
					rarity : rarityToNum(card.rarity),
					text : card.text,
					subText : card.flavor,
					power : card.power,
					toughness: card.toughness,
					loyalty : card.loyalty,
					multiverseid : card.multiverseid,
					releaseDate : utilities.mysqlDate(card.releaseDate, false),
					subTypes : (card.subtypes ? card.subtypes.join(", ") : null),
					setId : null,
					magicId : card.id 
				},
				dependentObjs : [
				]
			};

			if(card.layout == "double-faced") {
				var ind = card.names.indexOf(card.name);
				if(card.cmc || card.type == "Land") {
					cardDBO.dbo.secondary_face = card.names[( ind == 0 ? 1 : 0)];
				}
				else {
					cardDBO.dbo.primary_face = card.names[( ind == 0 ? 1 : 0)];
				}
				// cardDBO.dbo.secondary_face = card.names[1];
				// cardDBO.dbo.primary_face = card.names[0];
			}


			var types = parseTypes(card);
			if(types.supertypes.length) {
				for(var i in types.supertypes) {
					var typeId = types.supertypes[i];
					cardDBO.dependentObjs.push({
						dbt : 'card_types',
						dbo : {
							id: null,
							card_id : null,
							type_id : typeId,
							type_level : 'SUPER'
						}
					});
				}
			}
			if(types.types.length) {
				for(var j in types.types) {
					var typeId = types.types[j];
					cardDBO.dependentObjs.push({
						dbt : 'card_types',
						dbo : {
							id: null,
							card_id : null,
							type_id : typeId,
							type_level : 'NORMAL'
						}
					});
				}	
			}
			var colors = parseColors(card);
			if(colors.length) {
				for(var k in colors) {
					var colorId = colors[k];
					cardDBO.dependentObjs.push({
						dbt : 'card_colors',
						dbo : {
							id: null,
							card_id : null,
							color_id : colorId
						}
					});
				}	
			}

			setDBO.dependentObjs.push(cardDBO);
		}

		objects.push( setDBO );

		// sqlInsertSet(set, set.cards);
	}

	var deferred = upsertSet(objects[0].dbo);
	deferred.then(function(setId) {
		var dbos = objects[0].dependentObjs;
		for(var i in dbos) {
			var card = dbos[i];
			card.dbo.setId = setId;
		
			upsertCard(card);
		}
	}, function (){
		console.log("error");
		resp.json(arguments);
	})

});

function upsertSet(set) {
	var q = require("q");

	var deferred = q.defer();

	var selectQuery = "SELECT * FROM sets WHERE code = '" + set.code + "'";
	connection.query(selectQuery, function(err, rows, fields) {
		if(err) {
			console.log("SELECT SETS", err);
			deferred.reject();
		}
		if(rows.length == 0) {
			var query = "INSERT INTO sets (:keys) VALUES (:values)";
			query = query.replace(":keys",  Object.keys(set).join(", "))
						 .replace(":values", utilities.valuesOfObjectForMysql(set).join(", "));

			connection.query(query, function(err, rows, fields) {
				if(err){
					if(err.errno == 1062) {

					}
					else {
						console.log("INSERT SET", err, query); 	
					}
					deferred.reject();
					return;
				}
				deferred.resolve(rows.insertId);
			});		
		}
		else {
			var row = rows[0];
			deferred.resolve(row.id);
		}
	});

	return deferred.promise;
}

function upsertCard(card) {
	var q = require("q");

	var deferred = q.defer();

	var selectQuery = "SELECT * FROM cards WHERE magicId = '" + card.dbo.magicId + "'";
	connection.query(selectQuery, function(err, rows, fields) {
		if(err) {
			console.log("SELECT CARD", err);
			deferred.reject();
			return;
		}
		if(rows.length == 0) {
			var query = "INSERT INTO cards (:keys) VALUES (:values)";
			query = query.replace(":keys",  Object.keys(card.dbo).join(", "))
						 .replace(":values", utilities.valuesOfObjectForMysql(card.dbo).join(", "));
			connection.query(query, function(err, rows, fields) {
				if(err){
					deferred.reject([err, query]);
					return;
				}
				deferred.resolve(rows.insertId);
			});
		}
		else {
			var row = rows[0];
			var query = "UPDATE cards SET " ;
			var values = [];
			values = utilities.valuesOfObjectForMysqlUpdate(card.dbo, ['id']);
			query += values.join(", ");
			query += " WHERE id = '"+row.id+"'";
			connection.query(query, function(err, rows, fields) {
				if(err){
					deferred.reject([err, query]);
					return;
				}
				deferred.resolve(row.id);
			});
		}
	});

	deferred.promise.then(function(cardId) {
		for(var i in card.dependentObjs) {
			var obj = card.dependentObjs[i];
			if(obj.dbt == 'card_types') {
				linkType(cardId, obj.dbo.type_id, obj.dbo.type_level);
			}
			if(obj.dbt == 'card_colors') {
				linkColor(cardId, obj.dbo.color_id);
			}
		}
		resp.json(card);
	}, function(){
		console.log("CARD DEFERRED", arguments);
	});

	return deferred.promise;
}

function linkType(cardId, typeId, typeLevel) {
	var q = require("q");

	var deferred = q.defer();

	// var selectQuery = "SELECT * FROM card_types WHERE card_id = '" + cardId + "' AND type_id = '" + typeId + "' AND type_level = '" + typeLevel + "'";
	var query = "DELETE FROM card_types WHERE card_id = '"+cardId+"'";
	connection.query(query, function(err, rows, fields) {
		if(err) {
			console.log("SELECT card type", err, cardId, typeId, typeLevel);
			deferred.reject();
			return;
		}
		// if(rows.length == 0) {
		var q = "INSERT INTO card_types (:keys) VALUES (:values);";
			q = q.replace(":keys", "card_id, type_id, type_level");
			q = q.replace(":values", utilities.valuesOfObjectForMysql([cardId, typeId, typeLevel]).join(", "));
		connection.query(q, function(err, rows, fields) {
			if(err){
				if(err.errno == 1062) {
					console.log("card_types 1062", err, q, cardId, typeId, typeLevel); 	
				}
				else {
					console.log("card_types", err, q, cardId, typeId, typeLevel); 	
				}
				deferred.reject();
				return;
			}
			deferred.resolve(rows.insertId);
		});
		// }
		// else {
		// 	var row = rows[0];
		// 	deferred.resolve(row.id);
		// }
	});

	return deferred.promise;
}
function linkColor(cardId, colorId) {
	

	var q = require("q");

	var deferred = q.defer();

	// var selectQuery = "SELECT * FROM card_colors WHERE card_id = '" + cardId + "' AND color_id = '" + colorId + "'";
	var query = "DELETE FROM card_colors WHERE card_id = '"+cardId+"'";
	connection.query(query, function(err, rows, fields) {
		if(err) {
			console.log("SELECT card_colors", err, cardId, typeId, typeLevel);
			deferred.reject();
			return;
		}
		// if(rows.length == 0) {
		var q = "INSERT INTO card_colors (card_id, color_id) values ("+cardId+","+colorId+")";
		connection.query(q, function(err, rows, fields) {
			if(err){
				if(err.errno == 1062) {

				}
				else {
					console.log("color", err, q, rows);
				}
				deferred.reject();
				return;
			}
			deferred.resolve(rows.insertId);
		});
		// }
		// else {
		// 	var row = rows[0];
		// 	deferred.resolve(row.id);
		// }
	});

	return deferred.promise;
}

function rarityToNum (rarity) {
	switch(rarity) {
		case "Mythic Rare":
			return 0;
			break;
		case "Rare":
			return 1;
			break;
		case "Uncommon":
			return 2;
			break;
		case "Common":
			return 3;
			break;
		default:
			return 99;
	}
}

function parseTypes(card) {
	var typesIds = {
		"Legendary" : 1,
		"Basic" : 2,
		"Snow" : 3,
		"World" : 4,
		"Ongoing" : 5,
		"Instant" : 6,
		"Sorcery" : 7,
		"Artifact" : 8,
		"Enchantment" : 9,
		"Creature" : 10,
		"Land" : 11,
		"Planeswalker" : 12,
		"Tribal" : 13,
		"Conspiracy" : 14,
		"Plane" : 15,
		"Phenomenon" : 16,
		"Scheme" : 17,
		"Vanguard" : 18,
		"Enchant" : 19,
		"Eaturecray" : 20,
		"Player" : 21
	}
	var typesToLink = [];
	if(card.types && card.types.length) {
		for(var i in card.types) {
			var type = card.types[i];
			if(typesIds[type] == undefined) {
				console.log(type);
			}
			else {
				typesToLink.push(typesIds[type]);
			}
		}
	}
	var superTypesToLink = [];
	if(card.supertypes && card.supertypes.length) {
		for(var i in card.supertypes) {
			var type = card.supertypes[i];
			if(typesIds[type] == undefined) {
				console.log(type);
			}
			else {
				superTypesToLink.push(typesIds[type]);
			}
		}
	}

	return {
		types : typesToLink,
		supertypes : superTypesToLink
	}
}
function parseColors(card) {
	var colorsIds = {
		"R" : 1, "Red" 		: 1,
		"B" : 2, "Black" 	: 2,
		"U" : 3, "Blue" 	: 3,
		"W" : 4, "White" 	: 4,
		"G" : 5, "Green" 	: 5,
		"Colorless" : 6
	}
	var colorsToLink = [];
	if(card.colors && card.colors.length) {
		for(var i in card.colors) {
			var color = card.colors[i];
			colorsToLink.push(colorsIds[color]);
		}
	}
	else if (card.colorIdentity && card.colorIdentity.length) {
		for(var i in card.colorIdentity) {
			var color = card.colorIdentity[i];
			colorsToLink.push(colorsIds[color]);
		}	
	}
	else {
		if(card.type != "Land") {
			colorsToLink.push(colorsIds['Colorless']);
		}
	}
	return colorsToLink;
}

http.createServer(app).listen(app.get('port'), app.get("id"), function(){
  console.log('Express server listening on port:' + app.get('port'));
});

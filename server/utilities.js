module.exports = {
	mysqlDateTime : function() {
		var now = new Date();
		var myDate_string = now.toISOString();
			myDate_string = myDate_string.replace("T"," ");
			myDate_string = myDate_string.substring(0, myDate_string.length - 5);
		return myDate_string;
	},
	mysqlDate : function(d, useNow) {
		var now = new Date();
		if(d!=undefined){
			if(d.getFullYear) {
				now=d;
			}
			else {
				now = new Date(d);
			}
		}
		else if (useNow === false) {
			return null;
		}
		var year, month, day;
        year = String(now.getFullYear());
        month = String(now.getMonth() + 1);
        if (month.length == 1) {
            month = "0" + month;
        }
        day = String(now.getDate());
        if (day.length == 1) {
            day = "0" + day;
        }
        return year + "-" + month + "-" + day;
	},
	valuesOfObject: function(obj) {
		var keys = Object.keys(obj);
		var vals = [];
		for(var i = 0; i < keys.length; i++) {
			vals.push(obj[keys[i]]);
		}
		return vals;
	},
	valuesOfObjectForMysql: function(obj) {
		var keys = Object.keys(obj);
		var vals = [];
		for(var i = 0; i < keys.length; i++) {
			var value = obj[keys[i]];
			if(value == null || value == undefined) {
				value = "null";
			}
			else {
				if(value.replace) {
					value = value.replace(new RegExp("'", 'g'),"\\'");
					value = value.replace(new RegExp('"', 'g'),'\\"');
				}
				value = "'"+value+"'";
			}
			vals.push(value);
		}
		return vals;
	}
	,
	valuesOfObjectForMysqlUpdate: function(obj, ignoreKeys) {
		var keys = Object.keys(obj);
		var vals = [];
		for(var i = 0; i < keys.length; i++) {
			if(ignoreKeys.indexOf(keys[i]) !== -1) {
				continue;
			}

			var value = obj[keys[i]];

			if(value == null || value == undefined) {
				value = "null";
			}
			else {
				if(value.replace) {
					value = value.replace(new RegExp("'", 'g'),"\\'");
					value = value.replace(new RegExp('"', 'g'),'\\"');
				}
				value = "'"+value+"'";
			}
			value = keys[i] + " = "+value;
			vals.push(value);
		}
		return vals;
	}
}
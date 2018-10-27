const p_to_p_routes = require('./p_to_p_routes');

module.exports = function(app, db) {
	p_to_p_routes(app, db);
};

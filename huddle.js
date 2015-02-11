define([
	"bower_modules/jquery/dist/jquery",
	"bower_modules/davclient/bin/davclient",
	"bower_modules/huddlejs/bin/api.js"

], function($, dav, api) {

	api.prototype = dav;

	return api

});
define(['jquery', 'q'], function($,Q) {

	function Data() {
	  	this.self = this;
	  	self.path = null;
	  	self.data = null;
	}

	Data.prototype.success = function(){}
	Data.prototype.failure = function(){}
	Data.prototype.GET = function(url){
		return Q($.ajax({
			    url: url, 
			    type: "GET"
			})).then(function (data) {
			    self.data = data;
			    self.success(data);
			}, function (xhr) {
			    self.failure(xhr);
			});
	}

	return new Data();

});

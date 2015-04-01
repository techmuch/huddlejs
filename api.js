define([
	'jquery',
	'davclient'
], function($, dav) {



	/*
	This is a full javascript library implement of the huddle API 

	Documentation
	=============

	The huddle library is dependant on jquery

	Overview
	--------

	Starting from scratch:

	huddle.login(username, password) -> promise

	actions can be chained by:

	huddle.login(username, password)
	.then(function(loginResponse){
		return huddle.changePassword('1234')
	})
	.then(function(changeResponse){
		return huddle.logout()
	})

	The example above will login the user, change the user's password,
	and log the user out. The "then" method allows the actions to
	execute in order without blocking the rest of the code.
*/



	Huddle = function(host) {
			var self = this;
			var huddle = this;
			var queryObjectCache = null;

			var huddleHost = host || 'https://huddle2.asdl.ae.gatech.edu';

			self.queryParam = function() {
				if(queryObjectCache === null){
					var o = {};
					var s = location.search.split('?');
					for (var i = 1; i < s.length; i++) {
						var a = s[i].split('&');
						for (var j = 0; j < a.length; j++) {
							var v = a[j].split('=');
							o[v[0]] = v[1];
						};
					};
					queryObjectCache = o;
					return o;
				}
				else{
					return queryObjectCache;
				}
				
			};

			self.getDefaultDatasetManifest = function() {
				return huddle.ajax({
					url: huddle.queryParam().resource_url,
					type: "GET"
				})
			};

			self.sessions = function() {
				return huddle.ajax({
					url: "/session/active",
					type: "GET"
				})
			};

			self.login = function(username, password) {
				return huddle.ajax({
					url: "/session/login",
					type: "POST",
					data: JSON.stringify({
						username: username,
						password: password,
						success_url: "/project"
					})
				})
			};

			self.logout = function() {
				return huddle.ajax({
					url: "/session/logout",
					type: "GET"
				})
			};

			self.getUserRecord = function(userId) {
				return huddle.ajax({
					url: "/api/users/" + userId,
					type: "GET"
				})
			};

			self.createUser = function(email, password) { // STILL NOT WORKING!!!
				return huddle.ajax({
					url: "/session/registration",
					type: "POST"
				}).then(function(registrationResponse) {
					huddle.ajax({
						url: "/api/users",
						type: "POST",
						data: JSON.stringify({
							"username": email,
							"email": email,
							"organization": "",
							"created": ""
						})
					}).then(function(createUserResponse) {
						huddle.ajax({
							url: "/session/setpwrd",
							type: "POST",
							data: JSON.stringify({
								"authorization": createUserResponse.authorization,
								"username": email,
								"password": password
							})
						})
					})
				})
			};

			self.deleteUser = function(userId) {
				return huddle.getUserRecord(userId).then(function(data) {
					huddle.ajax({
						url: "/api/users/" + userId,
						type: "DELETE"
					}, data.etag);
				})
			};

			self.listUsers = function() {
				return huddle.ajax({
					url: "/api/users?data=all",
					type: "GET"
				})
			};

			self.changePassword = function(new_password) {
				return huddle.ajax({
					url: "/session/modpwrd",
					type: "POST",
					data: JSON.stringify({
						password: new_password
					})
				})
			};

			self.modUserRecord = function(userId, patchObject) {
				var o = {};
				o.set = typeof patchObject.set === "undefined" ? {} : patchObject.set;
				o.unset = typeof patchObject.unset === "undefined" ? {} : patchObject.unset;

				return huddle.getUserRecord(userId).then(function(userRecord) {
					huddle.ajax({
						url: "/api/users/" + userRecord.id,
						type: "PATCH",
						data: JSON.stringify(o)
					}, userRecord.etag)
				})
			};

			self.listWorkshops = function() {
				return huddle.ajax({
					url: "/api/workshops?data=all",
					type: "GET",
				})
			};

			self.listWorkshopsInProject = function(projectId) {
				return huddle.listWorkshops()
					.then(function(projects) {
						function compare(a, b) {
							if (a.title < b.title)
								return -1;
							if (a.title > b.title)
								return 1;
							return 0;
						}

						projects.sort(compare);

						var o = [];

						for (var i = 0; i < projects.length; i++) {
							if (projectId === projects[i].project_id) {
								o.push(projects[i])
							}
						};
						console.log('filtered workshops: ', o);
						return o;
					})
			};

			self.listParticipants = function() {
				return huddle.ajax({
					url: "/api/participants?data=all",
					type: "GET"
				})
			};

			self.listParticipantsInWorkshop = function(workshopId) {
				return huddle.listParticipants()
					.then(function(participants) {
						function compare(a, b) {
							if (a.title < b.title)
								return -1;
							if (a.title > b.title)
								return 1;
							return 0;
						}

						participants.sort(compare);

						var o = [];

						for (var i = 0; i < participants.length; i++) {
							if (workshopId === participants[i].workshop_id) {
								o.push(participants[i])
							}
						};
						console.log('filtered participants: ', o);
						return o;
					})
			};

			self.listParticipantsInProject = function(projectId) {
				var workshops = [];
				var participants = [];
				return huddle.listWorkshopsInProject(projectId)
					.then(function(data) {
						workshops = data;
					})
					.then(function() {
						return huddle.listParticipants()
					})
					.then(function(data) {
						participants = data;
					})
					.then(function() {
						var o = [];
						for (var i = 0; i < participants.length; i++) {
							for (var j = 0; j < workshops.length; j++) {
								if (workshops[j].id === participants[i].workshop_id)
									o.push(participants[i]);
							};
						};

						function compare(a, b) {
							if (a.full_name < b.full_name)
								return -1;
							if (a.full_name > b.full_name)
								return 1;
							return 0;
						}

						o.sort(compare);

						console.log('filtered participants: ', o);
						return o;
					})
			};

			self.joinWorkshop = function(participantId, pin) {

			};

			self.getWorkshopRecord = function(workshopId) {
				return huddle.ajax({
					url: "/api/workshops/" + workshopId,
					type: "GET"
				})
			};

			self.modWorkshopRecord = function(workshopId, patchObject) {
				var o = {};
				o.set = typeof patchObject.set === "undefined" ? {} : patchObject.set;
				o.unset = typeof patchObject.unset === "undefined" ? {} : patchObject.unset;

				return huddle.getWorkshopRecord(workshopId)
					.then(function(workshopRecord) {
						return huddle.ajax({
							url: "/api/workshops/" + workshopId,
							type: "PATCH",
							data: JSON.stringify(o)
						}, workshopRecord.etag)
					})
			};

			self.startWorkshop = function(workshopId) {
				return huddle.ajax({
					url: "/session/workshop/" + workshopId,
					type: "POST",
					headers: {
						"X-HTTP-METHOD": "START"
					}
				})
			};

			self.stopWorkshop = function(workshopId) {
				return huddle.ajax({
					url: "/session/workshop/" + workshopId,
					type: "POST",
					headers: {
						"X-HTTP-METHOD": "STOP"
					}
				})
			};

			self.addParticipant = function(workshopId, participantName) {
				return huddle.ajax({
					url: "/api/participants",
					type: "POST",
					data: JSON.stringify({
						full_name: participantName,
						name: participantName,
						workshop_id: workshopId
					})
				})
			};

			self.removeParticipant = function(participantId) {
				return huddle.ajax({
					url: "/api/participants/" + participantId,
					type: "DELETE"
				})
			};

			// Need to create the idea of a project object
			// example: huddle.project('project_id').addUser(user_object)
			self.listProjects = function() {
				return huddle.ajax({
					url: "/api/projects?data=all",
					type: "GET",
				})
			};

			self.getProjectRecord = function(projectId) {
				return huddle.ajax({
					url: "/api/projects/" + projectId,
					type: "GET",
				})
			};

			self.modProjectRecord = function(projectId, patchObject) {
				var o = {};
				o.set = typeof patchObject.set === "undefined" ? {} : patchObject.set;
				o.unset = typeof patchObject.unset === "undefined" ? {} : patchObject.unset;

				return huddle.getProjectRecord(projectId)
					.then(function(projectRecord) {
						return huddle.ajax({
							url: "/api/projects/" + projectId,
							type: "PATCH",
							data: JSON.stringify(o)
						}, projectRecord.etag)
					})
			};

			self.deleteProject = function(projectId) {
				return huddle.getProjectRecord(projectId)
					.then(function(projectRecord) {
						huddle.ajax({
							url: "/api/projects/" + projectId,
							type: "DELETE"
						}, projectRecord.etag)
					})
			};

			self.createProject = function(projectTitle, projectOwner) {
				return huddle.ajax({
					url: "/api/projects",
					type: "POST",
					data: JSON.stringify({
						created: "",
						description: "",
						organization: "",
						owner: projectOwner,
						title: projectTitle
					})
				})
			};

			self.addUsersToProject = function(projectId, arrayOfuserId, arrayOfUserRoles) {
				var arrayOfUserRoles = typeof arrayOfUserRoles === "undefined" ? [] : arrayOfUserRoles;
				var o = [];
				for (var i = 0; i < arrayOfuserId.length; i++) {
					o.push({
						user_id: arrayOfuserId[i],
						role: typeof arrayOfUserRoles[i] === "undefined" ? "o" : arrayOfUserRoles[i]
					});
				};
				return huddle.ajax({
					headers: {
						"X-HTTP-METHOD": "ADD"
					},
					url: "/api/projects/" + projectId,
					type: "POST",
					data: JSON.stringify(o)
				})
			};

			self.removeUsersFromProject = function(projectId, arrayOfuserId) {
				var o = [];
				for (var i = 0; i < arrayOfuserId.length; i++) {
					o.push(arrayOfuserId[i]);
				};
				return huddle.ajax({
					headers: {
						"X-HTTP-METHOD": "REMOVE"
					},
					url: "/api/projects/" + projectId,
					type: "POST",
					data: JSON.stringify(o)
				})
			};

			self.changeUserRolesInProject = function(projectId, arrayOfuserId, arrayOfUserRoles) {
				return huddle.removeUsersFromProject(projectId, arrayOfuserId)
					.then(function() {
						return huddle.addUsersToProject(projectId, arrayOfuserId, arrayOfUserRoles)
					})
			};

			self.listAppsInProject = function(projectId) {
				var finalPromise = new $.Deferred()
				var path = '/data/' + projectId + '/apps';
				var apps = [];
				var promises = [];
				huddle.propfind(path).then(function(paths) {
					for (var i = paths.content.items.length - 1; i >= 0; i--) {
						currentPromise = huddle.get(path + '/' + paths.content.items[i].path[6] + '/manifest.json')
						currentPromise.then(function(manifestFile) {
							apps.push(JSON.parse(manifestFile.content))
						})
						promises.push(currentPromise)
					}
				}).then(function() {
					return $.when.apply($, promises).then(function() {
						console.log(apps);
						finalPromise.resolve(apps);
					})
				})
				return finalPromise.promise()
			};

			self.listDatasetsInProject = function(projectId) {
				var finalPromise = new $.Deferred()
				var path = '/data/' + projectId + '/datasets';
				var apps = [];
				var promises = [];
				huddle.propfind(path).then(function(paths) {
					for (var i = paths.content.items.length - 1; i >= 0; i--) {
						currentPromise = huddle.get(path + '/' + paths.content.items[i].path[6] + '/manifest.json')
						currentPromise.then(function(manifestFile) {
							apps.push(JSON.parse(manifestFile.content))
						})
						promises.push(currentPromise)
					}
				}).then(function() {
					return $.when.apply($, promises).then(function() {
						console.log(apps);
						finalPromise.resolve(apps);
					})
				})
				return finalPromise.promise()
			};

			self.ls = function(projectId, path) {
				var path = '/data/' + projectId + '/' + path;
				return huddle.propfind(path).then(function(results) {
					console.log(results)
				})
			};

			self.read = function(projectId, path) {
				var path = '/data/' + projectId + '/' + path;
				return huddle.get(path).then(function(results) {
					console.log(results)
				})
			};

			self.write = function(projectId, path, data, etag) {
				var etag = etag || null
				var path = '/data/' + projectId + '/' + path;
				return huddle.put(path, data).then(function(results) {
					console.log(results)
				})
			};

			self.ajax = function(ajaxObject, etag) {

				ajaxObject.headers = typeof ajaxObject.headers === "undefined" ? {} : ajaxObject.headers;
				ajaxObject.headers["Accept"] = "application/json";
				ajaxObject.headers["Content-Type"] = "application/json";

				if (typeof etag !== "undefined") {
					ajaxObject.headers["If-Match"] = etag;
				}
				debugger;
				ajaxObject.url = huddleHost + ajaxObject.url;

				ajaxObject.dataType = 'json';

				ajaxObject.processData = false;

				return $.ajax(ajaxObject)
					.then(function(data) {
						console.log(data);
						return data;
					});
			};

			self.dav = dav;

			self.propfind = function(path, depth) {
				var depth = depth || 1
				var promise = new $.Deferred();
				debugger;
				huddle.dav.PROPFIND(huddleHost+path, function(status, statusText, content, headers) {
					if (content !== undefined) {
						var result = {
							status: status,
							statusText: statusText,
							content: content,
							headers: headers
						}
						console.log(result);
						promise.resolve(result);
					}
				}, this, depth);
				return promise.promise()
			};

			self.get = function(path) {
				var promise = new $.Deferred();
				huddle.dav.GET(huddleHost+path, function(status, statusText, content, headers) {
					if (content !== undefined) {
						var result = {
							status: status,
							statusText: statusText,
							content: content,
							headers: headers
						}
						console.log(result);
						promise.resolve(result);
					}
				}, this, 1);
				return promise.promise()
			};

			self.put = function(path, data) {
				var promise = new $.Deferred();
				huddle.dav.PUT(huddleHost+path, data, function(status, statusText, content, headers) {
					if (content !== undefined) {
						var result = {
							status: status,
							statusText: statusText,
							content: content,
							headers: headers
						}
						console.log(result);
						promise.resolve(result);
					}
				}, this, 1);
				return promise.promise()
			};

			self.post = function(path, data) {
				var promise = new $.Deferred();
				huddle.dav.POST(huddleHost+path, data, function(status, statusText, content, headers) {
					if (content !== undefined) {
						var result = {
							status: status,
							statusText: statusText,
							content: content,
							headers: headers
						}
						console.log(result);
						promise.resolve(result);
					}
				}, this, 1);
				return promise.promise()
			};

			self.delete = function(path) {
				var promise = new $.Deferred();
				huddle.dav.DELETE(huddleHost+path, function(status, statusText, content, headers) {
					if (content !== undefined) {
						var result = {
							status: status,
							statusText: statusText,
							content: content,
							headers: headers
						}
						console.log(result);
						promise.resolve(result);
					}
				}, this, 1);
				return promise.promise()
			}
	}

	return new Huddle();
})
$(function() {

    Parse.$ = jQuery;

    // Initialize Parse with your Parse application javascript keys
    Parse.initialize("KyueCTE3edcgkBYXNWK8xUELxvLXdrOR4hoCcbLB",
        "GauBt1jLTOfVaCdzoD3yCe8ZI1AaC3Wec9ekyx7l");

    // The Application
    // ---------------

    // The main view that lets a user manage their todo items
    var RegisterFormView = Parse.View.extend({

        // Delegated events for creating new items, and clearing completed ones.
        events: {
            "click #submit": "submit",
            "click #snap": "snap",
            "click #retake": "retake",
            "blur input": "validate"
        },

        el: ".content",

        // At initialization we bind to the relevant events on the `Todos`
        // collection, when items are added or changed. Kick things off by
        // loading any preexisting todos that might be saved to Parse.
        initialize: function() {
            console.log("initialize register");
            var self = this;

            _.bindAll(this, 'render', 'submit', 'snap', 'gumSuccess', 'gumError', 'convertCanvasToImage', "close", "retake", "validate");

            // Main todo management template
            this.render();

            this.picTaken = null;

            this.video = document.querySelector('video');
            this.canvas = document.getElementById("canvas"),
                this.context = canvas.getContext("2d");
            this.Form = Parse.Object.extend("Form");

            navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

            if (navigator.getUserMedia) {
                navigator.getUserMedia({
                    video: true
                }, this.gumSuccess, this.gumError);
            }
        },

        gumSuccess: function(stream) {
            // window.stream = stream;
            if ('mozSrcObject' in video) {
                video.mozSrcObject = stream;
            } else if (window.webkitURL) {
                video.src = window.webkitURL.createObjectURL(stream);
            } else {
                video.src = stream;
            }
            video.play();
        },

        gumError: function(error) {
            console.error('Error on getUserMedia', error);
        },

        validate: function(e) {
            if (e.target.id === "phonenumber") {
                e.target.value = e.target.value.replace(/\D/g, '');
            } else if (e.target.id === "email") {
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                re.test(e.target.value);
            }
        },

        // Re-rendering the App just means refreshing the statistics -- the rest
        // of the app doesn't change.
        render: function() {
            this.$el.html(_.template($("#register-form-template").html()));
            this.delegateEvents();
        },

        convertCanvasToImage: function(canvas) {
            var image = new Image();
            image.src = canvas.toDataURL("image/png");
            return image.src;
        },

        retake: function(e) {
            this.$('#canvas-div').addClass("hide");
            this.$('#video-div').removeClass("hide");
        },

        snap: function(e) {
            this.$('#canvas-div').removeClass("hide");
            this.$('#video-div').addClass("hide");
            this.context.drawImage(video, 0, 0, 640, 480);
            this.convertCanvasToImage(this.canvas);
        },

        submit: function(e) {
            console.log(video);
            if (this.$('#submit').hasClass("disabled")) {
                return;
            }

            if (this.$('#canvas-div').hasClass("hide")) {
                alert("Take a picture");
                return;
            }

            this.$('#submit').addClass("disabled");
            var formdata = document.getElementById("info");
            var form = new this.Form();
            var temp = this;

            var file = new Parse.File("myfile.png", {
                base64: this.convertCanvasToImage(this.canvas)
            });
            file.save().then(function() {

                form.set("name", formdata.elements["name"].value);
                form.set("email", formdata.elements["email"].value);
                form.set("hometown", formdata.elements["hometown"].value.replace(/,/g, ''));
                form.set("highschool", formdata.elements["highschool"].value.replace(/,/g, ''));
                form.set("phonenumber", formdata.elements["phonenumber"].value.replace(/\D/g, ''));
                form.set("residence", formdata.elements["residence"].value.replace(/,/g, ''));
                form.set("custom1", formdata.elements["custom1"].value.replace(/,/g, ''));
                form.set("custom2", formdata.elements["custom2"].value.replace(/,/g, ''));
                form.set("pic", file);
                var postACL = new Parse.ACL();
                postACL.setRoleWriteAccess("Pi Kapp", true);
                form.set("ACL", postACL);
                form.save(null, {
                    success: function(form) {
                        // Execute any logic that should take place after the object is saved.
                        alert('Submitted!');
                        formdata.reset();
                        temp.retake();
                        temp.$('#submit').removeClass("disabled");
                    },
                    error: function(form, error) {
                        // Execute any logic that should take place if the save fails.
                        // error is a Parse.Error with an error code and message.
                        alert('Failed to create new object, with error code: ' + error.message);
                    }
                });
            });
        },
        close: function() {
            video.stop();
            console.log("close form");
            _.each(this.subViews, function(view) {
                view.remove();
            });
            this.remove();
        }

    });

    var SignUpView = Parse.View.extend({
        events: {
            "submit form.signup-form": "signUp"
        },

        el: ".content",

        initialize: function() {
            _.bindAll(this, "signUp", "close");
            this.render();
        },

        signUp: function(e) {
            var self = this;
            var org = this.$("#signup-frat-name").val();
            var username = this.$("#signup-username").val();
            var password = this.$("#signup-password").val();

            Parse.User.signUp(username, password, {
                ACL: new Parse.ACL()
            }, {
                success: function(user) {
                    console.log("signup done");
                    user.set("org", org);
                    user.save();
                    new RegisterFormView();
                    self.undelegateEvents();
                    delete self;
                },

                error: function(user, error) {
                    self.$(".signup-form .error").html(_.escape(error.message)).show();
                    self.$(".signup-form button").removeAttr("disabled");
                }
            });

            this.$(".signup-form button").attr("disabled", "disabled");

            return false;
        },

        render: function() {
            this.$el.html(_.template($("#signup-template").html()));
            this.delegateEvents();
        },
        close: function() {
            _.each(this.subViews, function(view) {
                view.remove();
            });
            this.remove();
        }

    });

    var ProfileView = Parse.View.extend({
        events: {
            "click #talked": "talked"
        },

        el: ".content",

        variables: {
          "talked": []
        },

        initialize: function(rushid) {
            console.log(rushid);
            _.bindAll(this, "close", "talked");
            this.rushid = rushid;
            var form = Parse.Object.extend("Form");
            var query = new Parse.Query(form);
            query.equalTo("objectId", rushid);
            var temp = this;
            query.find().then(
                function(array) {
                    // The object was retrieved successfully.
                    var rushee = array[0];
                    temp.variables["rushee"] = rushee;
                    temp.render(temp.variables);

                    var talkedarr = rushee.get("talked");
                    for(var brother in talkedarr){
                      talkedarr[brother].fetch({
                        success: function(myObj){
                            temp.variables["talked"].push(myObj);
                            temp.render(temp.variables);
                        }
                      });
                    }

                    var date = new Date(rushee.createdAt);
                    var nextQuery = new Parse.Query(form);
                    nextQuery.limit(1);
                    nextQuery.greaterThan("createdAt", date);
                    nextQuery.find(
                        function(array) {
                            if (array.length != 0) {
                                // The object was retrieved successfully.
                                console.log("dates", array);
                                temp.$("#next")[0].href = "/#/rushes/" + array[0].id;
                            }
                        });

                    var prevQuery = new Parse.Query(form);
                    prevQuery.limit(1);
                    prevQuery.lessThan("createdAt", date);
                    prevQuery.descending("createdAt");
                    prevQuery.find(
                        function(array) {
                            if (array.length != 0) {
                                // The object was retrieved successfully.
                                console.log("dates", array);
                                temp.$("#previous")[0].href = "/#/rushes/" + array[0].id;
                            }
                        })
                },
                function(object, error) {
                    // The object was not retrieved successfully.
                    // error is a Parse.Error with an error code and message.
                    console.log("error");
                }
            );
        },

        talked: function(e) {
            this.variables["rushee"].addUnique("talked", Parse.User.current());
            this.variables["rushee"].rushee.save();
            console.log("save");
        },

        render: function(variables) {
            this.$el.html(_.template($("#rush-profile-template").html(), variables));
            this.delegateEvents();
        },

        close: function() {
            _.each(this.subViews, function(view) {
                view.remove();
            });
            this.remove();
        }

    });


    var LogInView = Parse.View.extend({
        events: {
            "submit form.login-form": "logIn",
        },

        el: ".content",

        initialize: function() {
            _.bindAll(this, "logIn", "close");
            this.render();
        },

        logIn: function(e) {
            var self = this;
            var username = this.$("#login-username").val();
            var password = this.$("#login-password").val();

            Parse.User.logIn(username, password, {
                success: function(user) {
                    new RegisterFormView();
                    self.undelegateEvents();
                    delete self;
                },

                error: function(user, error) {
                    self.$(".login-form .error").html("Invalid username or password. Please try again.").show();
                    self.$(".login-form button").removeAttr("disabled");
                }
            });

            this.$(".login-form button").attr("disabled", "disabled");

            return false;
        },

        render: function() {
            this.$el.html(_.template($("#login-template").html()));
            this.delegateEvents();
        },

        close: function() {
            _.each(this.subViews, function(view) {
                view.remove();
            });
            this.remove();
        }

    });

    var RushView = Parse.View.extend({
        events: {
            "click .log-out": "logOut",
            "click #download-csv": "downloadCSV",
            "click #drop": "drop",
            "click #talked": "talked"
        },

        el: ".content",

        variables: {
            "array": [],
            "data":[]
        },

        initialize: function() {
            _.bindAll(this, "drop", "close", "logOut", "downloadCSV", "talked");

            // {email: "b@gmail.com",
            //             fileurl: "http://files.parsetfss.com/483e5f02-671f-4596-9410-d4f5b27d06e9/tfss-e1317052-f8ba-4fb3-932e-1d2bea4542e6-myfile.png",
            //             hometown: "Burke, VA",
            //             name: "Burke Deutsch"}

            console.log("initialize rushes");
            this.render(this.variables);
            var form = Parse.Object.extend("Form");

            var notInactiveQuery = new Parse.Query(form);
            notInactiveQuery.notEqualTo("status", "inactive");

            var notNullQuery = new Parse.Query(form);
            notNullQuery.doesNotExist("status");

            var query = Parse.Query.or(notInactiveQuery, notNullQuery);
            query.descending("createdAt");
            query.limit(1000);
            var temp = this;
            query.find({
                success: function(array) {
                    // The object was retrieved successfully.
                    temp.variables["data"] = array;
                    temp.render(temp.variables);
                    for (obj in array) {
                        // console.log(array[obj].get('talked'));
                        if(array[obj].get('talked')){
                          console.log(array[obj].get('talked'));
                        }
                        if(array[obj].get('talked') && array[obj].get('talked').indexOf(Parse.User.current()) > -1){
                          console.log("talked");
                        }
                        var status = array[obj].get("status");
                        if (status == null || status != "inactive") {
                            var dict = {};
                            dict["name"] = array[obj].get("name");
                            dict["id"] = array[obj].id;
                            dict["email"] = array[obj].get("email");
                            dict["hometown"] = array[obj].get("hometown");
                            dict["highschool"] = array[obj].get("highschool");
                            dict["phonenumber"] = array[obj].get("phonenumber");
                            if (dict["phonenumber"].length == 10) {
                                dict["phonenumber"] = ["(", dict["phonenumber"].slice(0, 3), ")", dict["phonenumber"].slice(3, 6), "-", dict["phonenumber"].slice(6)].join('');
                            }
                            dict["residence"] = array[obj].get("residence");
                            dict["custom1"] = array[obj].get("custom1");
                            dict["custom2"] = array[obj].get("custom2");
                            dict["fileurl"] = array[obj].get("pic").url();
                            temp.variables["array"].push(dict);
                        }
                    }
                },
                error: function(object, error) {
                    // The object was not retrieved successfully.
                    // error is a Parse.Error with an error code and message.
                    console.log("error");
                }
            });
        },

        downloadCSV: function() {
            console.log(this.variables);
            var data = [];
            for (var val in this.variables) {
                for (var rushee in this.variables[val]) {
                    var sing_val = []
                    for (var key in this.variables[val][rushee]) {
                        sing_val.push(this.variables[val][rushee][key]);
                    }
                    console.log(sing_val);
                    data.push(sing_val);
                }
            }

            console.log(data);

            // var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
            var csvContent = "data:text/csv;charset=utf-8,";
            data.forEach(function(infoArray, index) {
                dataString = infoArray.join(",");
                csvContent += dataString + "\n";
            });

            var encodedUri = encodeURI(csvContent);
            window.open(encodedUri);
        },

        drop: function(e) {
            var confirm = window.confirm("Are you sure you want to drop him?");
            if (confirm == true) {
                // console.log(e.target.parentNode.parentNode.parentNode.id);
                var id = e.target.parentNode.parentNode.parentNode.id;
                this.variables["array"]
                var form = Parse.Object.extend("Form");
                var query = new Parse.Query(form);
                query.equalTo("objectId", id);
                query.find({
                    success: function(array) {
                        // The object was retrieved successfully.
                        console.log(array[0]);
                        array[0].set("status", "inactive");
                        array[0].save();
                        console.log("saved");
                    },
                    error: function(object, error) {
                        // The object was not retrieved successfully.
                        // error is a Parse.Error with an error code and message.
                        console.log("error");
                    }
                });
            }
        },

        talked: function(e) {
            var id = e.target.parentNode.parentNode.parentNode.id;
            for(var rushIndex in this.variables["data"]){
              var rush = this.variables["data"][rushIndex]
              if(rush.id === id){
                rush.addUnique("talked", Parse.User.current());
                rush.save();
                console.log("met saved");
                break;
              }
            }
        },

        // Logs out the user and shows the login view
        logOut: function(e) {
            Parse.User.logOut();
            new LogInView();
            this.undelegateEvents();
            delete this;
        },

        render: function(variables) {
            this.$el.html(_.template($("#rush-list-template").html(), variables));
            this.delegateEvents();
        },

        close: function() {
            console.log("close rushes");
            _.each(this.subViews, function(view) {
                view.remove();
            });
            this.remove();
        }

    });

    var AppRouter = Parse.Router.extend({
        routes: {
            "rushes": "rushes",
            "form": "form",
            "signup": "orgSignup",
            "signup/:orgid": "",
            "rushes/:rushid": "profile",
            "*path": "rushes"
        },

        initialize: function(options) {
            if (!this.checkCurrentUser()) {
                console.log("initialize", this.view);
                this.loadView(new LogInView());
            }
            console.log("initialize");
        },

        form: function() {
            console.log("register");
            this.loadView(new RegisterFormView());
        },

        rushes: function() {
            console.log("view");
            this.loadView(new RushView());
        },

        orgSignup: function() {
            console.log("signup");
            this.loadView(new SignUpView());
        },

        profile: function(rushid) {
            this.loadView(new ProfileView(rushid));
        },

        checkCurrentUser: function() {
            if (Parse.User.current()) {
                return true;
            }
            return false;
        },

        loadView: function(view) {
            // this.view && (this.view.close ? this.view.close() : this.view.remove());
            // this.view && this.view.remove();
            this.view = view;
        }

    });

    var router = new AppRouter;
    // new AppView;
    Parse.history.start();
});
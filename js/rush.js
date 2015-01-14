// An example Parse.js Backbone application based on the todo app by
// [Jérôme Gravel-Niquet](http://jgn.me/). This demo uses Parse to persist
// the todo items and provide user authentication and sessions.

$(function() {

  Parse.$ = jQuery;

  // Initialize Parse with your Parse application javascript keys
  Parse.initialize("KyueCTE3edcgkBYXNWK8xUELxvLXdrOR4hoCcbLB",
                   "GauBt1jLTOfVaCdzoD3yCe8ZI1AaC3Wec9ekyx7l");


////replace here if necessary

  // The Application
  // ---------------

  // The main view that lets a user manage their todo items
  var RegisterFormView = Parse.View.extend({

    // Delegated events for creating new items, and clearing completed ones.
    events: {
      "click .log-out": "logOut",
      "click #submit": "submit",
      "click #snap": "snap"
    },

    el: ".content",

    // At initialization we bind to the relevant events on the `Todos`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved to Parse.
    initialize: function() {
      var self = this;

      _.bindAll(this, 'render', 'logOut', 'submit', 'snap', 'gumSuccess', 'gumError', 'convertCanvasToImage');

      // Main todo management template
      this.$el.html(_.template($("#register-form-template").html()));

      this.video = document.querySelector('video');
      this.canvas = document.getElementById("canvas"),
          this.context = canvas.getContext("2d");
      this.Form = Parse.Object.extend("Form");

      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia({video: true }, this.gumSuccess, this.gumError);
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

    // Logs out the user and shows the login view
    logOut: function(e) {
      Parse.User.logOut();
      new LogInView();
      this.undelegateEvents();
      delete this;
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      this.delegateEvents();

    },

    convertCanvasToImage: function(canvas) {
      var image = new Image();
      image.src = canvas.toDataURL("image/png");
      return image.src;
    },

    snap: function(e) {
      this.context.drawImage(video, 0, 0, 640, 480);
      this.convertCanvasToImage(this.canvas);
    },
    // If you hit return in the main input field, create new Todo model
    submit: function(e) {
      var formdata = document.getElementById("info");

      var form = new this.Form();
     
      var file = new Parse.File("myfile.png", {base64: this.convertCanvasToImage(this.canvas)});
      file.save().then(function() {

        form.set("name", formdata.elements[0].value);
        form.set("email", formdata.elements[1].value);
        form.set("hometown", formdata.elements[2].value);
        form.set("pic", file);
        form.set("ACL", new Parse.ACL(Parse.User.current()));
        form.save(null, {
          success: function(form) {
            // Execute any logic that should take place after the object is saved.
            alert('Submitted!');
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
      _.each(this.subViews, function(view) { view.remove(); });
      this.remove();
    }

  });

  var SignUpView = Parse.View.extend({
    events: {
      "submit form.signup-form": "signUp"
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "signUp");
      this.render();
    },

    signUp: function(e) {
      var self = this;
      var org = this.$("#signup-frat-name").val();
      var username = this.$("#signup-username").val();
      var password = this.$("#signup-password").val();
      
      Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
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
      _.each(this.subViews, function(view) { view.remove(); });
      this.remove();
    }

  });

  var LogInView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn");
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
      _.each(this.subViews, function(view) { view.remove(); });
      this.remove();
    }

  });

  var RushView = Parse.View.extend({
    events: {
      "submit form.login-form": "logIn",
    },

    el: ".content",
    
    initialize: function() {
      _.bindAll(this, "logIn");

      // {email: "b@gmail.com",
      //             fileurl: "http://files.parsetfss.com/483e5f02-671f-4596-9410-d4f5b27d06e9/tfss-e1317052-f8ba-4fb3-932e-1d2bea4542e6-myfile.png",
      //             hometown: "Burke, VA",
      //             name: "Burke Deutsch"}

      var variables = {
        array: []
      }
      this.render(variables);
      var form = Parse.Object.extend("Form");
      var query = new Parse.Query(form);
      var temp = this;
      query.find({
        success: function(array) {
          // The object was retrieved successfully.
          for(obj in array){
            var dict = {};
            dict["fileurl"] = array[obj].get("pic").url();
            dict["name"] = array[obj].get("name");
            dict["email"] = array[obj].get("email");
            dict["hometown"] = array[obj].get("hometown");
            variables["array"].push(dict);
          }
          console.log("variables", variables);
          temp.render(variables);
        },
        error: function(object, error) {
          // The object was not retrieved successfully.
          // error is a Parse.Error with an error code and message.
          console.log("error");
        }
      });
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

    render: function(variables) {
      this.$el.html(_.template($("#rush-list-template").html(), variables));
      this.delegateEvents();
    },

    close: function() {
      _.each(this.subViews, function(view) { view.remove(); });
      this.remove();
    }

  });

  var AppRouter = Parse.Router.extend({
    routes: {
      "view": "view",
      "form": "form",
      "signup": "signup"
    },

    initialize: function(options) {
      if(!this.checkCurrentUser()){
        console.log("initialize");
        this.loadView(new LogInView());
      }
      console.log("false");
    },

    form: function() {
      console.log("register");
      this.loadView(new RegisterFormView());
    },

    view: function() {
      console.log("view");
      this.loadView(new RushView());
    },

    signup: function() {
      console.log("signup");
      this.loadView(new SignUpView());
    },

    checkCurrentUser: function() {
      if(Parse.User.current()){
        return true;
      }
      return false;
    },

    loadView : function(view) {
      this.view && (this.view.close ? this.view.close() : this.view.remove());
      this.view = view;
    }

  });

  var router = new AppRouter;
  // new AppView;
  Parse.history.start();
});

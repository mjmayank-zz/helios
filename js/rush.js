
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

    validate: function(e){
      console.log(e.target.class);
      if(e.target.id === "phonenumber"){
        e.target.value = e.target.value.replace(/\D/g,'');
      }
      else if(e.target.id === "email"){
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
      if(this.$('#canvas-div').hasClass("hide")){
        alert("Take a picture");
        return;
      }
      var formdata = document.getElementById("info");

      var form = new this.Form();

      var file = new Parse.File("myfile.png", {base64: this.convertCanvasToImage(this.canvas)});
      file.save().then(function() {

        form.set("name", formdata.elements[0].value);
        form.set("email", formdata.elements[1].value);
        form.set("hometown", formdata.elements[2].value.replace(/,/g,''));
        form.set("phonenumber", formdata.elements[3].value);
        form.set("custom1", formdata.elements[4].value);
        form.set("custom2", formdata.elements[5].value);
        form.set("pic", file);
        form.set("ACL", new Parse.ACL(Parse.User.current()));
        form.save(null, {
          success: function(form) {
            // Execute any logic that should take place after the object is saved.
            alert('Submitted!');
            this.render();
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
    _.bindAll(this, "signUp", "close");
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
    _.each(this.subViews, function(view) { view.remove(); });
    this.remove();
  }

});

var RushView = Parse.View.extend({
  events: {
    "click .log-out": "logOut",
    "submit form.login-form": "logIn",
    "click #download-csv":"downloadCSV"
  },

  el: ".content",

  initialize: function() {
    _.bindAll(this, "logIn", "close", "logOut");

      // {email: "b@gmail.com",
      //             fileurl: "http://files.parsetfss.com/483e5f02-671f-4596-9410-d4f5b27d06e9/tfss-e1317052-f8ba-4fb3-932e-1d2bea4542e6-myfile.png",
      //             hometown: "Burke, VA",
      //             name: "Burke Deutsch"}

      var variables = {
        "array": []
      }
      console.log("initialize rushes");
      this.variables = variables;

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
            dict["phonenumber"] = array[obj].get("phonenumber");
            dict["custom1"] = array[obj].get("custom1");
            dict["custom2"] = array[obj].get("custom2");
            variables["array"].push(dict);
          }
          this.variables = variables;
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

    downloadCSV: function(){
      var data = [];
      for (var val in this.variables){
        for (var rushee in this.variables[val]){
          var sing_val = []
          for (var key in this.variables[val][rushee]){
            sing_val.push(this.variables[val][rushee][key]);
          }
          console.log(sing_val);
          data.push(sing_val);
        }
      }

      console.log(data);

      // var data = [["name1", "city1", "some other info"], ["name2", "city2", "more info"]];
      var csvContent = "data:text/csv;charset=utf-8,";
      data.forEach(function(infoArray, index){
        dataString = infoArray.join(",");
        csvContent += dataString + "\n";
     }); 

      var encodedUri = encodeURI(csvContent);
      window.open(encodedUri);
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
      _.each(this.subViews, function(view) { view.remove(); });
      this.remove();
    }

  });

var AppRouter = Parse.Router.extend({
  routes: {
    "rushes": "rushes",
    "form": "form",
    "signup": "signup",
    "*path": "rushes"
  },

  initialize: function(options) {
    if(!this.checkCurrentUser()){
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
    // this.view && (this.view.close ? this.view.close() : this.view.remove());
    // this.view && this.view.remove();
    this.view = view;
  }

});

var router = new AppRouter;
  // new AppView;
  Parse.history.start();
});

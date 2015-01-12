Parse.initialize("KyueCTE3edcgkBYXNWK8xUELxvLXdrOR4hoCcbLB", "GauBt1jLTOfVaCdzoD3yCe8ZI1AaC3Wec9ekyx7l");


var form = Parse.Object.extend("Form");
var query = new Parse.Query(form);
query.find({
  success: function(array) {
    // The object was retrieved successfully.
    for(obj in array){
    	var fileurl = array[obj].get("pic").url();
    	var name = array[obj].get("name");
    	var email = array[obj].get("email");
      var hometown = array[obj].get("hometown");
    	document.body.innerHTML += '<div class="rush-card"><div class="row"><div class="medium-3 columns"><img src="' + fileurl + '"></div><div class="medium-9 columns"><h1>' + name + ' </h1><h6>' + email + '</h6><h6>' + hometown + '</h6></div></div></div>'
    	console.log(array[obj].get("pic").url());
	}
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
    console.log("error");
  }
});
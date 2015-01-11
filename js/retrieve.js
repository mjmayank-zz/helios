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
    	document.body.innerHTML += '<h1>' + name + ' </h1>' + email + '<div><img src="' + fileurl + '"></div>'
    	console.log(array[obj].get("pic").url());
	}
  },
  error: function(object, error) {
    // The object was not retrieved successfully.
    // error is a Parse.Error with an error code and message.
    console.log("error");
  }
});
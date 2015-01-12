Parse.initialize("KyueCTE3edcgkBYXNWK8xUELxvLXdrOR4hoCcbLB", "GauBt1jLTOfVaCdzoD3yCe8ZI1AaC3Wec9ekyx7l");

var video = document.querySelector('video');
var canvas = document.getElementById("canvas"),
    context = canvas.getContext("2d");
var Form = Parse.Object.extend("Form");

function gumSuccess(stream) {
  // window.stream = stream;
  if ('mozSrcObject' in video) {
    video.mozSrcObject = stream;
  } else if (window.webkitURL) {
    video.src = window.webkitURL.createObjectURL(stream);
  } else {
    video.src = stream;
  }
  video.play();
}

function gumError(error) {
  console.error('Error on getUserMedia', error);
}

function gumInit() {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true }, gumSuccess, gumError);
  }
}

function takePicture(){
    context.drawImage(video, 0, 0, 640, 480);
    convertCanvasToImage(canvas);
}

document.getElementById("snap").addEventListener("click", function() {
    takePicture();
});

document.getElementById("submit").addEventListener("click", function() {

  var formdata = document.getElementById("info");

  var form = new Form();
 
  var file = new Parse.File("myfile.png", {base64: convertCanvasToImage(canvas)});
  file.save().then(function() {
    form.set("name", formdata.elements[0].value);
    form.set("email", formdata.elements[1].value);
    form.set("hometown", formdata.elements[2].value);
    form.set("pic", file);
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

});

function convertCanvasToImage(canvas) {
  var image = new Image();
  image.src = canvas.toDataURL("image/png");
  return image.src;
}

gumInit();
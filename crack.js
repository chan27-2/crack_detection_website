const URL = "https://teachablemachine.withgoogle.com/models/TB8f4SEpS/";

let model, webcam, labelContainer, labelContainer2, maxPredictions;

function readURL(input) {
  errorContainer = document.getElementById("error-no-image");
  if (input.files && input.files[0]) {
    var reader = new FileReader();

    reader.onload = function (e) {
      $(".image-upload-wrap").hide();

      $(".file-upload-image").attr("src", e.target.result);
      $(".file-upload-content").show();

      $(".image-title").html(input.files[0].name);
    };

    reader.readAsDataURL(input.files[0]);
    errorContainer.innerHTML = "";
  } else {
    removeUpload();
  }
}

function removeUpload() {
  document.getElementById("image-uploaded").src =
    "http://127.0.0.1:5500/crack.html#";
  for (let i = 0; i < maxPredictions; i++) {
    labelContainer.childNodes[i].innerHTML = "";
  }
  $(".file-upload-input").replaceWith($(".file-upload-input").clone());
  $(".file-upload-content").hide();
  $(".image-upload-wrap").show();
}

$(".image-upload-wrap").bind("dragover", function () {
  $(".image-upload-wrap").addClass("image-dropping");
});

$(".image-upload-wrap").bind("dragleave", function () {
  $(".image-upload-wrap").removeClass("image-dropping");
});

// Load the image model and setup the webcam
async function init() {
  const modelURL = URL + "model.json";
  const metadataURL = URL + "metadata.json";

  // load the model and metadata
  // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
  // or files from your local hard drive
  // Note: the pose library adds "tmImage" object to your window (window.tmImage)
  model = await tmImage.load(modelURL, metadataURL);
  maxPredictions = model.getTotalClasses();

  labelContainer = document.getElementById("label-container");
  labelContainer2 = document.getElementById("label-container2");

  for (let i = 0; i < maxPredictions; i++) {
    // and class labels
    labelContainer.appendChild(document.createElement("div"));
    labelContainer2.appendChild(document.createElement("div"));
  }
}

async function startWebCam() {
  if (webcam) {
    webcam.pause();
    webcam.stop();
  }
  const flip = true; // whether to flip the webcam
  webcam = new tmImage.Webcam(580, 400, flip); // width, height, flip
  await webcam.setup(); // request access to the webcam
  await webcam.play();
  window.requestAnimationFrame(loop);

  // append elements to the DOM
  webCont = document.getElementById("webcam-container");
  if (webCont.childElementCount == 1) {
    webCont.removeChild(webCont.childNodes[0]);
  }
  document.getElementById("webcam-container").appendChild(webcam.canvas);
}

async function loop() {
  webcam.update(); // update the webcam frame
  await predictVideo();
  window.requestAnimationFrame(loop);
}

// run the webcam image through the image model
async function predict() {
  errorContainer = document.getElementById("error-no-image");
  console.log(document.getElementById("image-uploaded").src);

  if (
    document.getElementById("image-uploaded").src ===
    "http://127.0.0.1:5500/crack.html#"
  ) {
    errorContainer.innerHTML = "No image Selected!!";
  } else {
    const prediction = await model.predict(
      document.getElementById("image-uploaded")
    );
    for (let i = 0; i < maxPredictions; i++) {
      const classPrediction =
        prediction[i].className +
        ": " +
        prediction[i].probability.toFixed(2) * 100 +
        "%";
      labelContainer.childNodes[i].innerHTML = classPrediction;
    }
  }
}

async function predictVideo() {
  const prediction = await model.predict(webcam.canvas);
  for (let i = 0; i < maxPredictions; i++) {
    const classPrediction =
      prediction[i].className +
      ": " +
      prediction[i].probability.toFixed(2) * 100 +
      "%";
    labelContainer2.childNodes[i].innerHTML = classPrediction;
  }
}

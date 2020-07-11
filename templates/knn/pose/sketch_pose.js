// Video and PoseNet
let video;
let poseNet;
let poses = [];
let skeleton;
// Neural Network
let brain;

// Interface
let dataButton;
let dataLabel;
let trainButton;
let classificationP;

function setup() {
  createCanvas(700, 500);
  video = createCapture(VIDEO);
  video.size(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);
  // This sets up an event that fills the global variable "poses"
  // with an array every time new poses are detected
  poseNet.on('pose', function (results) {
    poses = results;
  });
  // Hide the video element, and just show the canvas
  video.hide();

  classificationP = createP('waiting to train model');

  // The interface
  dataLabel = createSelect();
  dataLabel.option('Hi!');
  dataLabel.option('Good Bye');
  dataLabel.option('Thanks');
  dataLabel.option('Sorry');
  dataLabel.option('Nice To Meet You');
  dataLabel.option('Brother');
  dataLabel.option('Owl');
  dataLabel.option('Drink');
  dataLabel.option('Cup');

  dataButton = createButton('add example');
  dataButton.mousePressed(addExample);


  trainButton = createButton('train model');
  trainButton.mousePressed(trainModel);
  
  saveButton = createButton('save');
  saveButton.mousePressed(function() {
    brain.save();
  });

  // Load model
  //loadBtn = select('#load');
  //loadBtn.changed(function() {
  //  brain.load(loadBtn.elt.files, function() {
  //    select('#modelStatus').html('Custom Model Loaded!');
  //  });
  //});
  

  // Create the model
  let options = {
    inputs: 34,
    outputs: 6,
    task: 'classification',
    debug: true
  }
  brain = ml5.neuralNetwork(options);
}

// Train the model
function trainModel() {
  brain.normalizeData();
  let options = {
    epochs: 25
  }
  brain.train(options, finishedTraining);
}

// Begin prediction
function finishedTraining() {
  brain.load('model.json', function() {
    select('#modelStatus').html('Custom Model Loaded!');
  });
  classify();
}

// Classify
function classify() {
  if (poses.length > 0) {
    let inputs = getInputs();
    brain.classify(inputs, gotResults);
  }
}

function gotResults(error, results) {
  //  Log output
  // console.log(results);
  classificationP.html(`${results[0].label} (${floor(results[0].confidence * 100)})%`);
  // Classify again
  classify();
}

function getInputs() {
  let keypoints = poses[0].pose.keypoints;
  let inputs = [];
  for (let i = 0; i < keypoints.length; i++) {
    inputs.push(keypoints[i].position.x);
    inputs.push(keypoints[i].position.y);
  }
  return inputs;
}

//  Add a training example
function addExample() {
  if (poses.length > 0) {
    let inputs = getInputs();
    let target = dataLabel.value();
    brain.addData(inputs, [target]);
  }
}

// PoseNet ready
function modelReady() {
  console.log('model loaded');
}

// Draw PoseNet
function draw() {
  image(video, 0, 0, width, height);
  strokeWeight(2);
  // For one pose only (use a for loop for multiple poses!)
  if (poses.length > 0) {
    let pose = poses[0].pose;
    let skeleton = poses[0].skeleton
    for (let i = 0; i < pose.keypoints.length; i++) {
      fill(255);
      noStroke();
      ellipse(pose.keypoints[i].position.x, pose.keypoints[i].position.y, 8);}
     for (let i = 0; i < skeleton.length; i++) {
      let a = skeleton[i][0];
      let b = skeleton[i][1];
      strokeWeight(4);
      stroke(255);
      line(a.position.x, a.position.y, b.position.x, b.position.y);
    }
  }

}


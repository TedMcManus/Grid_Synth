var x = []; //X locations of circles
var y = []; //Y locations of circles
var w; //Width of circles
var col = []; //Stores info about coloring
let yscale=.99; //Scale on the Y-axis
let xscale=.6; //Scale on the Y-axis (these 2 things turn the square into a rectangle)
let gridnum = 12; //Number of rows/columns
let fund = 440; //Fundamental frequency
let N; //Cardinality
let monosynth; //voice
let polySynth; //poly synth


function setup() {
    //create a grid that scales with window size
    createCanvas(windowWidth, windowHeight);
    w=windowWidth/23;
    offset=w/4;
    for (var i = 0; i < gridnum; i++) {
        x[i] = (w + i * w)/xscale+offset;
        y[i] = (w + i * w)/yscale;
    }

    // Should the box be filled in the "unpressed" color? 
    for (var i = 0; i < sq(gridnum); i++) {
        col[i] = true;
    }
    
  //create an oscillator and polysynth
  monoSynth = new p5.MonoSynth();
  polySynth= new p5.PolySynth();
  polySynth.setADSR(.1,.1,.8,.2);
  //need this for Chrome
  userStartAudio();

  //Create the input window for the "cardinality" box
  Nx=20;
  Ny=windowHeight-windowHeight/10;
  N=createInput('');
  N.position(Nx,Ny);
  N.size(50);
}

function initialize(col){
    //Everything defaults to true
    for (var i = 0; i < sq(gridnum); i++) {
      col[i] = true;
  }
  return col;
}

//default the cardinality to 12-TET. :(
//Gets the value from the input box and sets to 12 if NaN
function getValue(){
  val=int(N.value());
  if(isNaN(val)){val=12};
  return val;
}

///////////// (j * 10 + i) = row number plus x position
function draw() {
    background(10,0,10);

    //Put text over the input box
    fill('white');
    text('Cardinality',Nx,Ny-20)
    rectMode(CENTER);
    stroke(0);
    for (var j = 0; j < y.length; j++) {
        for (var i = 0; i < x.length; i++) {
            //Clear the screen
            if(!keyIsPressed){
              col=initialize(col);
            }
            //Fill the "clicked" boxes black, white otherwise
            if (col[j * gridnum + i]) fill("white");
            else fill("black");
            ellipse(x[i], y[j], w, w);

            //Write in the numbers for the degree of each note
            textSize(20);
            fill(10,50,100);
            let center=floor(gridnum/2);
            y_index=center-j;
            x_index=i-center;
            let num = y_index + x_index;
            text(num, x[i]-w/8, y[j]+w/8);
        }
    }
}

//This is mostly unimportant
function mousePressed() {
    for (var j = 0; j < y.length; j++) {
        for (var i = 0; i < x.length; i++) {
            var dis = dist(mouseX, mouseY, x[i], y[j]);
            if(dis < w/2) col[j * gridnum + i] =! col[j * gridnum + i];
        }
    }
}

//Handle pressed keys
function keyPressed(){
  let i;
  let j;
  if(key === '1'){
    i=-4;
    j=2;
  }
  else if(key==='2'){
    i=-3;
    j=2;
  }
  else if(key==='3'){
    i=-2;
    j=2;
  }
  else if(key==='4'){
    i=-1;
    j=2;
  }
  else if(key==='5'){
    i=0;
    j=2;
  }
  else if(key==='6'){
    i=1;
    j=2;
  }
  else if(key==='7'){
    i=2;
    j=2;
  }
  else if(key==='8'){
    i=3;
    j=2;
  }
  else if(key==='9'){
    i=4;
    j=2;
  }
  else if(key==='0'){
    i=5;
    j=2;
  }
  else if(key==='q'){
    i=-4;
    j=1;
  }
  else if(key==='w'){
    i=-3;
    j=1;
  }
  else if(key==='e'){
    i=-2;
    j=1;
  }
  else if(key==='r'){
    i=-1;
    j=1;
  }
  else if(key==='t'){
    i=0;
    j=1;
  }
  else if(key==='y'){
    i=1;
    j=1;
  }
  else if(key==='u'){
    i=2;
    j=1;
  }
  else if(key==='i'){
    i=3;
    j=1;
  }
  else if(key==='o'){
    i=4;
    j=1;
  }
  else if(key==='p'){
    i=5;
    j=1;
  }
  else if(key==='a'){
    i=-4;
    j=0;
  }
  else if(key==='s'){
    i=-3;
    j=0;
  }
  else if(key==='d'){
    i=-2;
    j=0;
  }
  else if(key==='f'){
    i=-1;
    j=0;
  }
  else if(key==='g'){
    i=0;
    j=0;
  }
  else if(key==='h'){
    i=1;
    j=0;
  }
  else if(key==='j'){
    i=2;
    j=0;
  }
  else if(key==='k'){
    i=3;
    j=0;
  }
  else if(key==='l'){
    i=4;
    j=0;
  }
  else if(key===';'){
    i=5;
    j=0;
  }
  else if(key==='z'){
    i=-4;
    j=-1;
  }
  else if(key==='x'){
    i=-3;
    j=-1;
  }
  else if(key==='c'){
    i=-2;
    j=-1;
  }
  else if(key==='v'){
    i=-1;
    j=-1;
  }
  else if(key==='b'){
    i=0;
    j=-1;
  }
  else if(key==='n'){
    i=1;
    j=-1;
  }
  else if(key==='m'){
    i=2;
    j=-1;
  }
  else if(key===','){
    i=3;
    j=-1;
  }
  else if(key==='.'){
    i=4;
    j=-1;
  }
  let steps=[];
  steps=fastfactor(getValue());

  console.log(polySynth.notes);
  let freq=fund*pow(2,(i-j)/12);
  let vel=.1;
  let dur=2;
  polySynth.play(freq, vel, 0, dur);
  let center=floor(gridnum/2);
  j=center-j;
  i=center+i;
  polySynth.noteAttack();
  col[j * gridnum + i] =! col[j * gridnum + i];
}

//return the correct number of steps in the base-N system
function fastfactor(N){
  let outputarray=[];
      // save the number of 2s that divide n 
  while (N % 2 == 0) 
  { 
    N = N/2; 
    append(outputarray,2)
  } 
      // n must be odd at this point. So we can skip 
      // one element (Note i = i +2) 
  for (var i = 3; i <= N; i = i + 2) 
  { 
    // While i divides n, save i and divide n 
    while (N % i == 0) 
    { 
      console.log(i);
      append(outputarray,i);
      N = N/i; 
    } 
  } 
  return outputarray;    
}

function findUnique(arr){
  let out=[];
    // Pick all elements one by one
    for (var i = 0; i < length(arr); i++)
    {
        // Check if the picked element 
        for (var j = 0; j < i; j++)
        if (arr[i] == arr[j]){
            break;
        }
        if (i == j){
          out.append[arr[i]];
        }
    }
  return out;
}

//Handle released keys
function keyReleased(){
  let i;
  let j;
  if(key === '1'){
    i=-4;
    j=2;
  }
  else if(key==='2'){
    i=-3;
    j=2;
  }
  else if(key==='3'){
    i=-2;
    j=2;
  }
  else if(key==='4'){
    i=-1;
    j=2;
  }
  else if(key==='5'){
    i=0;
    j=2;
  }
  else if(key==='6'){
    i=1;
    j=2;
  }
  else if(key==='7'){
    i=2;
    j=2;
  }
  else if(key==='8'){
    i=3;
    j=2;
  }
  else if(key==='9'){
    i=4;
    j=2;
  }
  else if(key==='0'){
    i=5;
    j=2;
  }
  else if(key==='q'){
    i=-4;
    j=1;
  }
  else if(key==='w'){
    i=-3;
    j=1;
  }
  else if(key==='e'){
    i=-2;
    j=1;
  }
  else if(key==='r'){
    i=-1;
    j=1;
  }
  else if(key==='t'){
    i=0;
    j=1;
  }
  else if(key==='y'){
    i=1;
    j=1;
  }
  else if(key==='u'){
    i=2;
    j=1;
  }
  else if(key==='i'){
    i=3;
    j=1;
  }
  else if(key==='o'){
    i=4;
    j=1;
  }
  else if(key==='p'){
    i=5;
    j=1;
  }
  else if(key==='a'){
    i=-4;
    j=0;
  }
  else if(key==='s'){
    i=-3;
    j=0;
  }
  else if(key==='d'){
    i=-2;
    j=0;
  }
  else if(key==='f'){
    i=-1;
    j=0;
  }
  else if(key==='g'){
    i=0;
    j=0;
  }
  else if(key==='h'){
    i=1;
    j=0;
  }
  else if(key==='j'){
    i=2;
    j=0;
  }
  else if(key==='k'){
    i=3;
    j=0;
  }
  else if(key==='l'){
    i=4;
    j=0;
  }
  else if(key===';'){
    i=5;
    j=0;
  }
  else if(key==='z'){
    i=-4;
    j=-1;
  }
  else if(key==='x'){
    i=-3;
    j=-1;
  }
  else if(key==='c'){
    i=-2;
    j=-1;
  }
  else if(key==='v'){
    i=-1;
    j=-1;
  }
  else if(key==='b'){
    i=0;
    j=-1;
  }
  else if(key==='n'){
    i=1;
    j=-1;
  }
  else if(key==='m'){
    i=2;
    j=-1;
  }
  else if(key===','){
    i=3;
    j=-1;
  }
  else if(key==='.'){
    i=4;
    j=-1;
  }
  let center=floor(gridnum/2);
  j=center-j;
  i=center+i;
  if(!keyIsPressed){
    polySynth.noteRelease();
  }
  col[j * gridnum + i] =! col[j * gridnum + i];
}
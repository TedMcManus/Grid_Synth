let max;
max=20;
var notearr=[];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  for(i=0;i<max;i++){
    for(j=0;j<max;j++){
      bub= new Bubble(windowWidth/max*i,2*windowHeight/max*j);
      bub.show();
    }
  }
}

function mousePressed(){
  for(i=0;i<max;i++){
    for(j=0;j<max;j++){
      let d = dist(mouseX, mouseY, windowWidth/max*i,2*windowHeight/max*j);
      if(d<(windowWidth/max)){
        let clickindx=windowWidth/max*i;
        let clickindy=2*windowHeight/max*j;
      }
    }
  }
}

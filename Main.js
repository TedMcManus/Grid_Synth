var x = []; //X locations of circles
var y = []; //Y locations of circles
var w; //Width of circles
var col; //Stores info about coloring
let yscale=.55; //Scale on the Y-axis
let xscale=.8; //Scale on the Y-axis (these 2 things turn the square into a rectangle)
//let gridnum = 11; //Number of rows/columns
let fund = 220; //Fundamental frequency
let N; //Cardinality
let monoSynth; //voice
let polySynth; //poly synth
let EDO; //Current N in our N-EDO system
EDO=12;
let active_notes=[];
let place1=150;
let gridnumx = 12; //Number of rows/columns in x
let gridnumy = 4; //and in y
let keyboardscaling = 25; //Parameter that "fakes" a keyboard
let filter_envelope=new p5.Envelope(); //Envelope routed to filter frq
let metaharmonicity; //Which factors to choose in 3D system
let harmonicity; //Which factors to choose in 2D system
let fenv_is_on=true; //Is fenv active? 
let depth = 1000; //How much does the filter envelope affect frq? 
let j_mult = 4; //Default X and Y mult values
let i_mult = 3;
let fundamental; //Base frequency
let RVB; //Reverb
let DLY; //Delay
let DLYtype = 0; //0=mono, 'ping-pong' = ping-pong (stereo delay)
let Font; //Which font to use
let reload; //take a crapshoot? 
let Iguess;
let Jguess;
function preload() {
    Font = loadFont('Assets/OSANS.ttf'); //it's this font (bc it's fast (i hate coding))
}

//Hard-code the locations of the keyboard grid
let keygrid=[
    ['1','2','3','4','5','6','7','8','9','0','-','='],
    ['q','w','e','r','t','y','u','i','o','p','[',']'],
    ['a','s','d','f','g','h','j','k','l',';',"'",'Enter'],
    ['z','x','c','v','b','n','m',',','.','/'],
];

//This saves which keys are pressed
let keystates=[
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

//This saves which circles are filled with which color
col = [
    [],
    [],
    [],
    [],
];

function setup() {
    //create a grid that scales with window size
    //if ur screen is small u will have a bad time
    col=initialize(col);
    createCanvas(windowWidth, windowHeight,WEBGL);
    textFont(Font);
    w=windowWidth/23;
    offset=w/8;
    //Define X and Y locations for the circles
    for (var j = 0; j < gridnumy; j++) {
        for (var i = 0; i < gridnumx; i++) {
            x[i] = (w + i * w)/xscale+offset;
            y[j] = (w + j * w)/yscale;
        }
    } 

  //create an oscillator and polysynth
  //check p5 docs for more info on these
  monoSynth = new p5.MonoSynth('sawtooth');
  polySynth= new p5.PolySynth();
  polySynth.AudioVoice=monoSynth;
  //need this for Chrome
  userStartAudio(); //Yes I WILL start the audio on your browser. Don't fight it.

  //OpenGL uses a different coordinate system than deafult JS
  //also create some autoscaling step sizes here
  translate(-width/2, -height/2);
  H=windowHeight;
  Hstep=H/792;
  W=windowWidth;
  Wstep=W/1536;
  //Create the input window for the "cardinality" box
  Nx=20;
  Ny=windowHeight-windowHeight/10;
  N=createInput('Cardinality');
  N.position(Nx,Ny-58*Hstep);
  N.size(70);
  N.elt.value=12;

  ent = createButton('Load');
  ent.position(Nx+30,Ny-58*Hstep);
  ent.mousePressed(reloadfunc);


  //Base frequency input
  fundamental = createInput('');
  fundamental.position(place1*Wstep+225*Wstep+240*Wstep,Ny+35*Hstep);
  fundamental.size(70);
  fundamental.elt.value=fund;
  fundamental.input(fund_update);

  //How big should all the slider sizes be
  slidersize=windowWidth/12;
  slider_width=slidersize.toString()+'px'

  //How big should select boxes be
  selectwidth=windowWidth/20;
  select_width=selectwidth.toString()+'px'

  //The harmonicity/metaharmonicity (see documentation)
  harmonicity=createSelect('HARMONICITY');
  harmonicity.option('Scalar');
  harmonicity.option('Intermediate');
  harmonicity.option('Chordal');
  harmonicity.selected='Chordal';
  harmonicity.style('width',select_width);
  harmonicity.position(Nx,Ny+2*Hstep);

  metaharmonicity=createSelect('METAHARMONICITY');
  metaharmonicity.option('Scalar (1&2)');
  metaharmonicity.option('Inter (2&3)');
  metaharmonicity.option('Chordal (1&3)');
  metaharmonicity.selected='Inter (2&3)';
  metaharmonicity.style('width',select_width);
  metaharmonicity.position(Nx,Ny+50*Hstep);

  //Define the ASDR parameters of fenv
  fill('white');
  fATTACK=createSlider(0,5,.5,.1);
  fATTACK.position(450*Wstep,H-105*Hstep);
  fATTACK.style('width',slider_width);
  fATTACK.mouseReleased(fenv);

  fDECAY=createSlider(0,5,1,.1);
  fDECAY.position(450*Wstep,H-85*Hstep);
  fDECAY.style('width',slider_width);
  fDECAY.mouseReleased(fenv);

  fSUSTAIN=createSlider(0,1,1,.1);
  fSUSTAIN.position(450*Wstep,H-65*Hstep);
  fSUSTAIN.style('width',slider_width);
  fSUSTAIN.mouseReleased(fenv);

  fRELEASE=createSlider(0,5,1.5,.1);
  fRELEASE.position(450*Wstep,H-45*Hstep);
  fRELEASE.style('width',slider_width);
  fRELEASE.mouseReleased(fenv);

  fLEVEL=createSlider(0,3000,1000,100);
  fLEVEL.position(450*Wstep,H-25*Hstep);
  fLEVEL.style('width',slider_width);
  fLEVEL.mouseReleased(fenv);

  //Reverb parameters 
  FXwidth=(slidersize-W/50).toString()+'px'
  RVBtime=createSlider(0,10,5,.1);
  RVBtime.position(1000*Wstep-20,H-105*Hstep);
  RVBtime.style('width',FXwidth);
  RVBtime.mouseReleased(RVB_UPDATE);

  RVBDecay=createSlider(1,10,2,.1);
  RVBDecay.position(1000*Wstep-20,H-85*Hstep);
  RVBDecay.style('width',FXwidth);
  RVBDecay.mouseReleased(RVB_UPDATE);

  RVBDRYWET=createSlider(0,1,0,.05);
  RVBDRYWET.position(1000*Wstep-20,H-65*Hstep);
  RVBDRYWET.style('width',FXwidth);
  RVBDRYWET.mouseReleased(RVB_UPDATE);

  //Delay parameters
  DLYFB=createSlider(0,.99,0,.01);
  DLYFB.position(800*Wstep-20,H-105*Hstep);
  DLYFB.style('width',FXwidth);
  DLYFB.mouseReleased(DLY_UPDATE);

  DLYtime=createSlider(0,.99,.5,.01);
  DLYtime.position(800*Wstep-20,H-85*Hstep);
  DLYtime.style('width',FXwidth);
  DLYtime.mouseReleased(DLY_UPDATE);

  DLYleft=createSlider(0,.99,.5,.01);
  DLYleft.position(800*Wstep-20,H-65*Hstep);
  DLYleft.style('width',FXwidth);
  DLYleft.mouseReleased(DLY_UPDATE);

  DLYright=createSlider(0,.99,.5,.01);
  DLYright.position(800*Wstep-20,H-45*Hstep);
  DLYright.style('width',FXwidth);
  DLYright.mouseReleased(DLY_UPDATE);

  //Amp envelope parameters
  ATTACK=createSlider(0,5,.5,.1);
  ATTACK.position(220*Wstep,H-90*Hstep);
  ATTACK.style('width',slider_width);
  ATTACK.mouseReleased(env);

  DECAY=createSlider(0,5,1,.1);
  DECAY.position(220*Wstep,H-70*Hstep);
  DECAY.style('width',slider_width);
  DECAY.mouseReleased(env);

  SUSTAIN=createSlider(0,1,1,.1);
  SUSTAIN.position(220*Wstep,H-50*Hstep);
  SUSTAIN.style('width',slider_width);
  SUSTAIN.mouseReleased(env);

  RELEASE=createSlider(0,5,1.5,.1);
  RELEASE.position(220*Wstep,H-30*Hstep);
  RELEASE.style('width',slider_width);
  RELEASE.mouseReleased(env);

  //Which waveform to use
  WAVE=createSelect('WAVE');
  WAVE.option('sine');
  WAVE.option('triangle');
  WAVE.option('sawtooth');
  WAVE.option('square');
  //this is what we like to call "bad practice"
  WAVE.position(place1*Wstep+225*Wstep+240*Wstep,H-105*Hstep);
  WAVE.changed(update_wave);
  WAVE.selected('triangle')

  //Define the filter and set up the effects chain
  //the "connect"/"disconnect" methods set up where the audio flows
  F= new p5.Filter();
  polySynth.disconnect();
  polySynth.connect(F);
  F.setType('lowpass');
  F.set(5000,10);
  F.freq(filter_envelope);
  filter_envelope.aLevel=depth;
  F.disconnect();

  RVB=new p5.Reverb();

  DLY=new p5.Delay();

  //Switch the delay mode
  DLYbutton=createButton('Mono/Stereo');
  DLYbutton.position(800*Wstep,H-137*Hstep);
  DLYbutton.mousePressed(DLYflip);

  //More audio path setup here
  DLY.process(F);
  RVB.process(DLY);
  DLY.disconnect();
  F.connect(RVB);
  DLY.connect(RVB);

  DLY_UPDATE();
  RVB_UPDATE();

  //Sould the filter envelope be engaged? 
  fenvbutton=createButton('On/Off');
  fenvbutton.position(place1*Wstep+225*Wstep+120,H-137*Hstep);
  fenvbutton.mousePressed(fenvflip);


  //By default, p5 is always running the draw loop. We don't want this, because
  //it's a huge performance hit. This disables the draw looping so we can only 
  //call it when it's absolutely necessary
  noLoop();
}

function initialize(col){
    //Which circles get filled with the "off" color? 
    //Everything defaults to true
    for (var j = 0; j <  gridnumx; j++) {
        for (var i = 0; i < gridnumy; i++) {
            col[i][j]=true;
        }
    }
  return col;
}

function draw() { 
    //Set up openGL coordinates and update what we need
    clear();
    translate(-width/2, -height/2);
    rectMode(CENTER);
    ystep=100/y.length;
    xstep=100/x.length;
    background(10,0,10);
    textSize(15);
    H=windowHeight;
    Hstep=H/792;
    W=windowWidth;
    Wstep=W/1536;

    //Put text by the input boxes
    fill(255);
    text('Release',place1*Wstep,H-15*Hstep);
    text('Sustain',place1*Wstep,H-35*Hstep);
    text('Decay',place1*Wstep,H-55*Hstep);
    text('Attack',place1*Wstep,H-75*Hstep);

    text('Depth',place1*Wstep+225*Wstep,H-10*Hstep);
    text('Release',place1*Wstep+225*Wstep,H-30*Hstep);
    text('Sustain',place1*Wstep+225*Wstep,H-50*Hstep);
    text('Decay',place1*Wstep+225*Wstep,H-70*Hstep);
    text('Attack',place1*Wstep+225*Wstep,H-90*Hstep);

    text('Depth',place1*Wstep+225*Wstep+345*Wstep+200*Wstep,H-50*Hstep);
    text('Decay',place1*Wstep+225*Wstep+345*Wstep+200*Wstep,H-70*Hstep);
    text('Time',place1*Wstep+225*Wstep+345*Wstep+200*Wstep,H-90*Hstep);

    text('Time',place1*Wstep+225*Wstep+345*Wstep,H-70*Hstep);
    text('FB',place1*Wstep+225*Wstep+345*Wstep,H-90*Hstep);
    text('(Right)',place1*Wstep+225*Wstep+345*Wstep,H-30*Hstep);
    text('(Left)',place1*Wstep+225*Wstep+345*Wstep,H-50*Hstep);

    fill(255,50,100);
    text('Amp Envelope',place1*Wstep,H-100*Hstep);
    text('Filter Envelope',place1*Wstep+225*Wstep,H-120*Hstep);
    text('Reverb',place1*Wstep+225*Wstep+345*Wstep+200*Wstep,H-120*Hstep);
    text('Delay',place1*Wstep+225*Wstep+345*Wstep,H-120*Hstep);

    text('Cardinality',Nx,H-140);
    text('Harmonicity',Nx,H-83);
    text('Metaharm',Nx,H-35);
    text('Wave Type',place1*Wstep+225*Wstep+235*Wstep,H-120*Hstep);
    text('Fund (Hz)',place1*Wstep+225*Wstep+235*Wstep,H-58*Hstep);

    //Map the arrow keys to resonance and cutoff
    if (keyIsDown(LEFT_ARROW)) {
        r=F.res();
        F.res(r-1);
      }
      if (keyIsDown(RIGHT_ARROW)) {
        r=F.res();
        F.res(r+1);
      }
      if (keyIsDown(UP_ARROW)) {
        F.biquad.frequency.value+=50;
      }
      if (keyIsDown(DOWN_ARROW)) {
        F.biquad.frequency.value-=50;
    }

    //Set up the line that displays note values against the octave
    stroke('white'); 
    strokeWeight(4);
    lineX=Wstep*1400;
    startY=Hstep*50;
    endY=Hstep*750;
    Ylen=Hstep*750-Hstep*50;
    textSize(15);
    p1=startY+Ylen/4;
    p2=startY+Ylen/2;
    p3=startY+3*Ylen/4;

    line(lineX,startY,lineX,endY);

    line(lineX-10,startY,lineX+10,startY);
    text('4',lineX-30,startY+5);

    line(lineX-10,p1,lineX+10,p1);
    text('3',lineX-30,p1+5);

    line(lineX-10,p2,lineX+10,p2);
    text('2',lineX-30,p2+5);

    line(lineX-10,p3,lineX+10,p3);
    text('1',lineX-30,p3+5);

    line(lineX-10,endY,lineX+10,endY);
    text('0',lineX-30,endY+5);
    text('Octave',lineX-25,endY+20);

    //The loop here draws all the little circles that signify whether 
    //a note is sounding or not
    strokeWeight(1);
    for (var j = 0; j < y.length; j++) {
        for (var i = 0; i < x.length; i++) {
            if(!keyIsPressed){
              col=initialize(col); //reset everything
            }
            //this little bit scales the color with space across screen
            let num = j*j_mult + i*i_mult;
            filler=[150+xstep*i,80,100+ystep*j];
            inv_filler=[155-(xstep*i),135-(ystep*j)/2,250];
            //Fill the "clicked" boxes black, white otherwise
            if (col[y.length-j-1][i]){
                fill(filler);
                ellipse(x[i]+keyboardscaling*(4-j), y[y.length-j-1], w, w);
            }
            else {
                fill("black"); //the note is on
                ellipse(x[i]+keyboardscaling*(4-j), y[y.length-j-1], w, w);

                //since the note is on, draw it on the octave grid
                strokeWeight(5);
                stroke(250, 0, 158); 
                Yloc=(num/getValue())*(Ylen/4);
                line(lineX-10,endY-(Yloc*Hstep),lineX+15,endY-(Yloc*Hstep));
                strokeWeight(1);
                stroke(255);
            }
            //Write in the numbers for the degree of each note
            textSize(20);
            fill(inv_filler);           
            text(num, x[i]-w/8+keyboardscaling*(4-j), y[y.length-j-1]+w/8);
        }
    }
}

function RVB_UPDATE(){ //changes RVB parameters to slider values
    RVB.drywet(RVBDRYWET.value());
    RVB.set(RVBtime.value(),RVBDecay.value());
}

function DLY_UPDATE(){//changes DLY parameters to slider values
    DLY.process(F,DLYtime.value(),DLYFB.value());
    if(DLYtype=='pingPong'){
        DLY.rightDelay.delayTime.value=DLYright.value();
        DLY.leftDelay.delayTime.value=DLYleft.value();
    }
}

function DLYflip(){
    //reads the state of mono/stereo switch and takes appropriate actions
    if(DLYtype==0){
        DLYtype='pingPong'; //we're in stereo
        DLYbutton.style('background-color', color(25, 23, 200, 50));
        DLY.rightDelay.delayTime.value=DLYright.value();
        DLY.leftDelay.delayTime.value=DLYleft.value();
    }
    else{
        DLYtype=0; //we're in mono
        DLY.setType(0);
        DLYbutton.style('background-color', color('white'));
        DLY.rightDelay.delayTime.value=DLYtime.value();
        DLY.leftDelay.delayTime.value=DLYtime.value();
    }
}

function fund_update(){
    fund=int(fundamental.elt.value); //change "N"
}


function fenvflip(){ //turn filter envelope on or off
    fenv_is_on=!fenv_is_on;
    if(fenv_is_on){
        fenvbutton.style('background-color', color('white'));
    };
    if(!fenv_is_on){
        fenvbutton.style('background-color', color(25, 23, 200, 50));
    };
}

//default the cardinality to 12-TET. :(
//Gets the value from the input box and sets to 12 if NaN
function getValue(){
  val=int(N.value());
  if(isNaN(val)){val=12};
  return val;
}


function env() { //updates amp envelope values
    polySynth.setADSR(ATTACK.value(),DECAY.value(),SUSTAIN.value(),RELEASE.value());
    console.log(SUSTAIN.value())
}

function fenv() { //updates filter envelope values
    filter_envelope.setADSR(fATTACK.value(),fDECAY.value(),fSUSTAIN.value(),fRELEASE.value());
    filter_envelope.setRange(fLEVEL.value(),0);
}

function update_wave(){ //updates waveform
    for(var i=0;i<polySynth.audiovoices.length;i++){
        polySynth.audiovoices[i].oscillator.setType(WAVE.selected());
    }
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
      append(outputarray,i);
      N = N/i; 
    } 
  } 
  outputarray=[...new Set(outputarray)] //remove duplicates (thanks JS!)
  return outputarray;    
}

//get a list of powers of factors that are less than N/2
//why are we doing this? Read the docs!
function powerlist(arr){
    out=[]; //return this
    n=getValue()/2; //max value for a prime power
    for(i=0;i<arr.length;i++){
        tmp=arr[i];
        j=1;
        out_ni=[];
        while(pow(tmp,j)<n){
            append(out_ni,pow(tmp,j))
            j++;
        }
        append(out,out_ni);
    }
    return out;
}

function reloadfunc(){
    reload=true;
}
function monte(arr){ //just go crazy
    Iguess=round(random(0,arr.length-1))
    Jguess=round(random(0,arr.length-1))
    if(Iguess==Jguess){
        [Iguess,Jguess]=monte(); //random recursion... fun??
    }
    return [Iguess,Jguess];
}

//takes X and Y position and returns a frequency value in hertz
function frqcalc(J_in,I_in){
    //generate the list of all the relevant prime powers
    power_list = powerlist(fastfactor(getValue()));
    if(power_list.length==3){ //we're in a 3D system, need metaheuristic
        power_list=metaheuristic(power_list);
        //console.log('Invoking Metaheuristic');
        reload=true;
    }
    if(power_list.length>3){ //Literally take a shot in the dark
        if(reload){
            [Iguess,Jguess]=monte(power_list);
        }
        power_list=invoke_the_monte_carlo_method(Iguess,Jguess,power_list);
        reload = false;
    }
    else{reload=true;}
    //console.log(power_list);
    [j_mult,i_mult]=heuristic(power_list); //else, assume we're in 2-D
    if(i_mult>j_mult){
        tmp = j_mult;
        j_mult=i_mult;
        i_mult=tmp;
        console.log('swap');
    }
    //console.log(powerlist(fastfactor(getValue())));
    return fund*pow(2,(-j_mult*J_in+i_mult*I_in)/getValue()); //this is the frequency
}

function heuristic(arr){ //for a 2-D system
    if(arr.length==2){
        selector=harmonicity.elt.selectedIndex;
        i_arr=arr[0];
        j_arr=arr[1];
        if(selector==0){ //scalar
            j_out=j_arr[0];
            i_out=i_arr[0];
        }
        if(selector==1){ //intermediate
            j_out=j_arr[floor((j_arr.length-1)/2)]; //HACK
            i_out=i_arr[floor((i_arr.length-1)/2)];
        }
        if(selector==2){ //chordal
            j_out=j_arr[j_arr.length-1];
            i_out=i_arr[i_arr.length-1];
        }
        return [j_out,i_out];
    }
}

function metaheuristic(arr){ //for a 3-D system
    //console.log(arr);
    selector=metaharmonicity.elt.selectedIndex;
    if(selector==0){ //scalar, 1 and 2
        j_out=arr[1];
        i_out=arr[0];
    }
    if(selector==1){ //intermediate, 2 and 3
        j_out=arr[2]; 
        i_out=arr[1];
    }
    if(selector==2){ //chordal, 1 and 3
        j_out=arr[2];
        i_out=arr[0];
    }
    return [i_out,j_out];
}

function invoke_the_monte_carlo_method(iind,jind,arr){
    //literally take a random guess
    console.log(arr.length);
    j_out=arr[jind]; 
    i_out=arr[iind];
    return [i_out,j_out];
}

//handle all the key presses
function keyPressed(){
    //turn loop back on if the arrow keys are down
    //this lets the user hold down the key to get a sweep in cutoff or res
    if (key=='ArrowLeft') {
        r=F.res();
        F.res(r-1);
        loop();
        return;
      }
    
      if (key=='ArrowRight') {
        r=F.res();
        F.res(r+1);
        loop();
        return;
      }
    
      if (key=='ArrowUp') {
        F.biquad.frequency.value+=50;
        loop();
        return;
      }
    
      if (key=='ArrowDown') {
        F.biquad.frequency.value-=50;
        loop();
        return;
    }

    //Space bar triggers filter envelope
    if(key==' '){
        filter_envelope.triggerAttack();
        //console.log('filter envelope open');
        return
    }
    if (fenv_is_on){
        filter_envelope.triggerAttack();
    }
    //get x and y value of the key
    arr=locate_key(key);
    key_x=arr[0];
    key_y=arr[1];

    keystates[key_y][key_x]=1; //this note is on, update the grid
    col[key_y][key_x] =! col[key_y][key_x]; //change the color as well
    l=active_notes.length; //an open spot in the active note array for the new note 

    i=key_x;
    j=key_y;
    frqtotest=frqcalc(j,i); //get the frequency
    //active_notes.unshift(frqtotest); //And insert it in the first voice in the active array
    //NOTE - this creates a "round robin" voice allocation scheme. Playing 8 notes will 
    //cause the first note played to "drop out," and releasing all notes clears the active array

    polySynth.noteAttack(frqtotest);
    console.log(polySynth.notes);
    redraw(); //update the visuals
}

//handle all keyup events
function keyReleased(){
    if(key==' '){
        filter_envelope.triggerRelease();
        //console.log('filter envelope closed');
        return
    }
    if (fenv_is_on){
        filter_envelope.triggerRelease();
    }

    //turn off looping if the arrow keys are up
    if (key=='ArrowLeft') {
        noLoop();
        return;
      }
    
      if (key=='ArrowRight') {
        noLoop();
        return;
      }
    
      if (key=='ArrowUp') {
        noLoop();
        return;
      }
    
      if (key=='ArrowDown') {
        noLoop();
        return;
    }

    //which key was released? 
    arr=locate_key(key);
    key_x=arr[0];
    key_y=arr[1];
    col[key_y][key_x] =! col[key_y][key_x];
    i=key_x;
    j=key_y;

    //the "oh shit" function, this clears everything when no keys are down
    //occasionally errors accumulate when the notes are playing for a while, this 
    //ensures that the last keyup gives us a blank slate. 
    if(!keyIsPressed){
        polySynth.noteRelease();
        active_notes=[];
        clear_all();
        noLoop();
        redraw();
        return;
    }

    //notearr=get_notes();
    if(keystates[key_y][key_x]==1){ //if key is on
        keystates[key_y][key_x]=0; //turn it off
        i=key_x;
        j=key_y;
        frqtotest=frqcalc(j,i); //get the frequency
    }
    polySynth.noteRelease(frqtotest); //and trigger the release envelope 
    console.log(polySynth.notes);
    redraw();
}

// a basic mod function b/c JS goes negative, which I do not want
function mod(n, m) {
    return ((n % m) + m) % m;
}

//Where is the key that I just pressed/released? 
function locate_key(key){
    let key_y;
    let key_x;

    //find the Y location
    for(var i = 0; i<=3;i++){
        if (keygrid[i].includes(key)){
            key_y=i;
        }
    }

    key_x=keygrid[key_y].indexOf(key);
    return [key_x,key_y];
}

function get_notes(){
    notearr=[];
    for(var i = 0; i<=3;i++){
        jmax=keygrid[i].length;
        for(var j = 0; j<jmax;j++){
            if (keystates[i][j]==1){
                append(notearr,[i,j]);
            }
        }
    }
    return notearr;
}

function clear_all(){
    notearr=[];
    for(var i = 0; i<=3;i++){
        jmax=keygrid[i].length;
        for(var j = 0; j<jmax;j++){
                keystates[i][j]=0;;
        }
    }
}

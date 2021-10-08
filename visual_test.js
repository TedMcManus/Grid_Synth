var x = []; //X locations of circles
var y = []; //Y locations of circles
var w; //Width of circles
var col; //Stores info about coloring
let yscale=.5; //Scale on the Y-axis
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
let gridnumx = 14; //Number of rows/columns in x
let gridnumy = 4; //and in y
let filter_envelope=new p5.Envelope();
let metaharmonicity;
let harmonicity;
let fenv_is_on=true;
let depth = 1000;
let j_mult = 4;
let i_mult = 3;
let fundamental;


let keygrid=[
    ['1','2','3','4','5','6','7','8','9','0','-','='],
    ['q','w','e','r','t','y','u','i','o','p','[',']'],
    ['a','s','d','f','g','h','j','k','l',';',"'"],
    ['z','x','c','v','b','n','m',',','.','/','-','='],
];

let keystates=[
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0],
];

col = [
    [],
    [],
    [],
    [],
];

function setup() {
    //create a grid that scales with window size
    col=initialize(col);
    createCanvas(windowWidth, windowHeight);
    w=windowWidth/23;
    offset=w/4;
    for (var i = 0; i < gridnumx; i++) {
        for (var j = 0; j < gridnumy; j++) {
            x[i] = (w + i * w)/xscale+offset;
            y[j] = (w + j * w)/yscale;
        }
    }
    
  //create an oscillator and polysynth
  monoSynth = new p5.MonoSynth('sawtooth');
  polySynth= new p5.PolySynth();
  polySynth.AudioVoice=monoSynth;
  //polySynth.setADSR(.1,.1,.8,.2);
  //need this for Chrome
  userStartAudio(); //Yes I WILL start the audio on your browser. Don't fight it.

  H=windowHeight;
  Hstep=H/792;
  W=windowWidth;
  Wstep=W/1536
  //Create the input window for the "cardinality" box
  Nx=20;
  Ny=windowHeight-windowHeight/10;
  N=createInput('Cardinality');
  N.position(Nx,Ny-33*Hstep);
  N.size(70);
  N.elt.value=12;

  fundamental = createInput('');
  fundamental.position(place1*Wstep+225*Wstep+240*Wstep,Ny+35*Hstep);
  fundamental.size(70);
  fundamental.elt.value=fund;
  fundamental.input(fund_update);
  
  harmonicity=createSelect('HARMONICITY');
  harmonicity.option('Scalar');
  harmonicity.option('Intermediate');
  harmonicity.option('Chordal');
  harmonicity.selected='Chordal';
  harmonicity.position(Nx,Ny+12*Hstep);

  metaharmonicity=createSelect('METAHARMONICITY');
  metaharmonicity.option('Scalar (1&2)');
  metaharmonicity.option('Inter (2&3)');
  metaharmonicity.option('Chordal (1&3)');
  metaharmonicity.selected='Inter (2&3)';
  metaharmonicity.position(Nx,Ny+50*Hstep);


  fill('white');
  fATTACK=createSlider(0,5,.5,.1);
  fATTACK.position(450*Wstep,H-105*Hstep);
  fATTACK.style('width','150px');
  fATTACK.mouseReleased(fenv);

  fDECAY=createSlider(0,5,1,.1);
  fDECAY.position(450*Wstep,H-85*Hstep);
  fDECAY.style('width','150px');
  fDECAY.mouseReleased(fenv);

  fSUSTAIN=createSlider(0,1,1,.1);
  fSUSTAIN.position(450*Wstep,H-65*Hstep);
  fSUSTAIN.style('width','150px');
  fSUSTAIN.mouseReleased(fenv);

  fRELEASE=createSlider(0,5,1.5,.1);
  fRELEASE.position(450*Wstep,H-45*Hstep);
  fRELEASE.style('width','150px');
  fRELEASE.mouseReleased(fenv);

  fLEVEL=createSlider(0,3000,1000,100);
  fLEVEL.position(450*Wstep,H-25*Hstep);
  fLEVEL.style('width','150px');
  fLEVEL.mouseReleased(fenv);
  fenv();

  ATTACK=createSlider(0,5,.5,.1);
  ATTACK.position(220*Wstep,H-90*Hstep);
  ATTACK.style('width','150px');
  ATTACK.mouseReleased(env);

  DECAY=createSlider(0,5,1,.1);
  DECAY.position(220*Wstep,H-70*Hstep);
  DECAY.style('width','150px');
  DECAY.mouseReleased(env);

  SUSTAIN=createSlider(0,1,1,.1);
  SUSTAIN.position(220*Wstep,H-50*Hstep);
  SUSTAIN.style('width','150px');
  SUSTAIN.mouseReleased(env);

  RELEASE=createSlider(0,5,1.5,.1);
  RELEASE.position(220*Wstep,H-30*Hstep);
  RELEASE.style('width','150px');
  RELEASE.mouseReleased(env);

  WAVE=createSelect('WAVE');
  WAVE.option('sine');
  WAVE.option('triangle');
  WAVE.option('sawtooth');
  WAVE.option('square');
  WAVE.position(place1*Wstep+225*Wstep+240*Wstep,H-90*Hstep);
  //this is what we like to call "bad practice"
  WAVE.changed(update_wave);

  F= new p5.Filter();
  polySynth.disconnect();
  polySynth.connect(F);
  F.setType('lowpass');
  F.set(5000,10);
  F.freq(filter_envelope);
  filter_envelope.aLevel=depth;

  fenvbutton=createButton('On/Off');
  fenvbutton.position(place1*Wstep+225*Wstep+150,H-137*Hstep);
  fenvbutton.mousePressed(fenvflip);

  //Draw all the static stuff in the setup loop to save time

  background(10,0,10);
  textSize(20);
  
  //Put text by the input boxes
    fill('white');
    text('Release',place1*Wstep,H-15*Hstep);
    text('Sustain',place1*Wstep,H-35*Hstep);
    text('Decay',place1*Wstep,H-55*Hstep);
    text('Attack',place1*Wstep,H-75*Hstep);

    text('Depth',place1*Wstep+225*Wstep,H-10*Hstep);
    text('Release',place1*Wstep+225*Wstep,H-30*Hstep);
    text('Sustain',place1*Wstep+225*Wstep,H-50*Hstep);
    text('Decay',place1*Wstep+225*Wstep,H-70*Hstep);
    text('Attack',place1*Wstep+225*Wstep,H-90*Hstep);

    fill(255,50,100);
    text('Amp Envelope',place1*Wstep,H-100*Hstep);
    text('Filter Envelope',place1*Wstep+225*Wstep,H-120*Hstep);

    text('Cardinality',Nx,H-120);
    text('Harmonicity',Nx,H-73);
    text('Wave Type',place1*Wstep+225*Wstep+235*Wstep,H-100*Hstep);
    text('Fundamental (Hz)',place1*Wstep+225*Wstep+235*Wstep,H-48*Hstep);
}

function initialize(col){
    //Everything defaults to true
    for (var j = 0; j <  gridnumx; j++) {
        for (var i = 0; i < gridnumy; i++) {
            col[i][j]=true;
        }
    }
  return col;
}

function fund_update(){
    fund=int(fundamental.elt.value);
}


function fenvflip(){
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

///////////// (j * 10 + i) = row number plus x position
function draw() {


    rectMode(CENTER);
    stroke(0);
    ystep=100/y.length;
    xstep=100/x.length;
    fund_update();
    
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

    for (var j = 0; j < y.length; j++) {
        for (var i = 0; i < x.length; i++) {
            //Clear the screen
            if(!keyIsPressed){
              col=initialize(col);
            }
            filler=[150+xstep*i,80,100+ystep*j];
            inv_filler=[155-(xstep*i),135-(ystep*j)/2,250];
            //Fill the "clicked" boxes black, white otherwise
            if (col[y.length-j-1][i]){
                fill(filler);
                ellipse(x[i], y[y.length-j-1], w, w);
            }
            else {
                fill("black");
                ellipse(x[i], y[y.length-j-1], w, w);
            }

            //Write in the numbers for the degree of each note
            textSize(20);
            fill(inv_filler);
            //let center=floor(gridnumx/2);
            //y_index=center-j;
            //x_index=i-center;
            let num = j*j_mult + i*i_mult;
            //console.log(j_mult,i_mult);
            text(num, x[i]-w/8, y[y.length-j-1]+w/8);
            
        }
    }
}

function env() {
    polySynth.setADSR(ATTACK.value(),DECAY.value(),SUSTAIN.value(),RELEASE.value());
}

function fenv() {
    filter_envelope.setADSR(fATTACK.value(),fDECAY.value(),fSUSTAIN.value(),fRELEASE.value());
    filter_envelope.setRange(fLEVEL.value(),0);
}

function update_wave(){
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
  outputarray=[...new Set(outputarray)]
  return outputarray;    
}

function powerlist(arr){
    out=[];
    n=getValue()/2;
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

function frqcalc(J_in,I_in){
    power_list = powerlist(fastfactor(getValue()));
    if(power_list.length==3){
        power_list=metaheuristic(power_list);
        console.log('Invoking Metaheuristic');
    }
    //console.log(power_list);
    [j_mult,i_mult]=heuristic(power_list);
    //console.log(powerlist(fastfactor(getValue())));
    return fund*pow(2,(-j_mult*J_in+i_mult*I_in)/getValue());
}

function heuristic(arr){
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

function metaheuristic(arr){
    console.log(arr);
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

function keyPressed(){
    if(key==' '){
        filter_envelope.triggerAttack();
        console.log('filter envelope open');
        return
    }
    if (fenv_is_on){
        filter_envelope.triggerAttack();
    }
    arr=locate_key(key);
    key_x=arr[0];
    key_y=arr[1];
    keystates[key_y][key_x]=1;
    col[key_y][key_x] =! col[key_y][key_x];
    notearr=get_notes();
    //console.log(notearr);
    //console.log(active_notes);
    l=active_notes.length;

    i=key_x;
    j=key_y;
    frqtotest=frqcalc(j,i);
    append(active_notes,frqtotest)
    polySynth.audiovoices[l].triggerAttack(frqtotest);

    if (key=LEFT_ARROW) {
        r=F.res();
        F.res(r-10);
      }
    
      if (key=RIGHT_ARROW) {
        r=F.res();
        F.res(r+10);
      }
    
      if (key=UP_ARROW) {
        F.biquad.frequency.value+=500;
      }
    
      if (key=DOWN_ARROW) {
        F.biquad.frequency.value-=500;
    }
}

function keyReleased(){
    if(key==' '){
        filter_envelope.triggerRelease();
        //console.log('filter envelope closed');
        return
    }
    if (fenv_is_on){
        filter_envelope.triggerRelease();
    }
    arr=locate_key(key);
    key_x=arr[0];
    key_y=arr[1];
    col[key_y][key_x] =! col[key_y][key_x];
    i=key_x;
    j=key_y;
    if(!keyIsPressed){
        polySynth.noteRelease();
        active_notes=[];
        clear_all();
        return;
    }
    notearr=get_notes();
    if(keystates[key_y][key_x]==1){
        keystates[key_y][key_x]=0;
        i=key_x;
        j=key_y;
        frqtotest=frqcalc(j,i);
        ind=active_notes.lastIndexOf(frqtotest);
        active_notes.splice(ind,1);
        polySynth.audiovoices[ind].triggerRelease();
    }
}

function mod(n, m) {
    return ((n % m) + m) % m;
}

function locate_key(key){
    let key_y;
    let key_x;

    for(var i = 0; i<=3;i++){
        if (keygrid[i].includes(key)){
            key_y=i;
        }
    }

    if(key_y==0){
        key_x=keygrid[0].indexOf(key);
        //xind=keygrid[0].indexOf(key)-keygrid[0].indexOf('5');
    }
    if(key_y==1){
        key_x=keygrid[1].indexOf(key);
        //xind=keygrid[1].indexOf(key)-keygrid[1].indexOf('t');
    }
    if(key_y==2){
        key_x=keygrid[2].indexOf(key);
        //xind=keygrid[2].indexOf(key)-keygrid[2].indexOf('g');
    }
    if(key_y==3){
        key_x=keygrid[3].indexOf(key);
        //xind=keygrid[3].indexOf(key)-keygrid[3].indexOf('b');
    }
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


function click(){
    console.log('clicked');
}
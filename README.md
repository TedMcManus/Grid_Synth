# Description
Driver code for a polyphonic synthesizer with a tonnetz-based user interface written in p5.js, accessible on GitHub Pages at [https://tedmcmanus.github.io/Grid_Synth/](https://tedmcmanus.github.io/Grid_Synth/) 

# Documentation

## Using the app
As it stands, this application has been tested on both Google Chrome and Microsoft Edge browsers. In theory, any web browser that supports the
[Web Audio API](https://caniuse.com/audio-api) and [P5.js](https://github.com/processing/p5.js/blob/main/contributor_docs/supported_browsers.md)
should be able to use the application without problems. 

## Controls
The application supports several user interactions:
#### PLAYING NOTES 
Pressing any key on your computer keyboard will trigger a note. On the top row, keys from "1" to "=" will work, on the second, "q" to "]", on the third, 
"a" to "'", and on the fourth, "z" to "/". The layout of a typical keyboard makes playing notes somewhat annoying, so if you have an ortholinear 
keyboard, definitely break it out here. Currently, using the mouse will not trigger notes, so this application will not function on an ipad, iphone, or other 
touchscreen-based device. 
#### FILTER CONTROLS
Pressing the space bar will trigger the filter envelope manually (as will playing a note while the envelope is on). Additionally, the arrow keys control 
filter parameters - up/down controls the cutoff and left/right controls the resonance (left is less, right is more). The filter will do something resembling self-resonating
if you really crank the resonance, but not in the nice clean way that most real LPFs will, so watch out with the right arrow key. 
#### OTHER CONTROLS
Sliders can be used to control the ADSR envelopes attached to the amp and filter, as well as the effects. The user can also use dropdown menus to select the core
waveform of the synthesizer, as well as change the fundamental pitch (the pitch of the note which bears the label "0") in an input box. The other inputs are for the 
cardinality (the number of tones to the octave), and the "harmonicity" and "metaharmonicity" of the system, which are terms that bear some explanation in the next section. 
#### THE SLIDER
Off to the right of the screen, there's a display that shows where the active notes lie in pitch space, showing their frequency over 4 octaves. 

## The Math
In this section, I will outline the basic algorithm for deciding which frequency is being played when a user hits a key on the keyboard. The 
following explanation does very little to engage with *why* the operations are taking place, but this will be adressed in an upcoming thesis in the Dartmouth 
department of music. 

First off, the code checks what the number in the "cardinality" input box is (we'll call it N), and splits the interval from the fundamental frequency 
to the note an octave above it into N equally-spaced intervals. This creates an N-TET (N-tone equally tempered) system. More about the theory of equal temperament is 
[here](https://en.wikipedia.org/wiki/Equal_temperament). 

Next, we do a prime factorization of N and store the prime factors in an array. For example, if N=12, we would have the array {2,2,3}. We then "prune" the array to remove 
duplicates (in 12-TET this leaves us with {2,3}). The array now contains only the unique prime factors of N. Next, we check if any power of these numbers is less than half of N. We store these new numbers in an array of arrays. 
For 12-TET, this gives us {{2,4},{3}}. The reaon that we're collecting these prime powers has to do with [Cauchy's Theorem](https://en.wikipedia.org/wiki/Cauchy%27s_theorem_(group_theory)), a 
result in group theory that states that we can always find subgroups whose order is a prime number or a power of a prime if that number divides the size of a finite group. Colelcting all such powers allows us to perform a decomposition of a group of size N, which is (in essence) what this algorithm is doing. However, you do not need to understand 
the math to play the instrument, which is sort of the whole point. 

A couple examples may be helpful. Suppose N=24. The process looks like 24-(factor)->{2,2,2,3}-(prune)->{2,3}-(check powers)->{{2,4,8},{3,9}}. 
For N=18, we have 18-(factor)->{2,3,3}-(prune)->{2,3}-(check powers)->{{2,4,8},{3}}. 

Next, we use a heuristic to choose a pair of these numbers, picking one number from the first array and another number from the second. I have three heuristics in the code. 
If the heuristic is "scalar," we choose the smallest numbers. In 24-TET, we would pick 2 and 3. The next is "intermediate," where we choose from the middle of the lists 
(rounding down in the case of an even-length list). In 24-TET, this gives us {4,3}. Finally, we have the "chordal" heuristic which picks the largest numbers from each array 
(8 and 9 in 24-TET). 

In the case that our number can be factored into 3 distinct primes, we use the "meta-heuristic" to pick which factors to consider. The easiest example is N=30 (30=2X3X5). 
The process is like this: 30-(factor)->{2,3,5}-(prune)->{2,3,5}-(check powers)->{{2,4,8},{3,6,9},{5}}. At this point, we use the meta-heuristic to choose which of these 
arrays to pass to the heuristic. This process works pretty similarly, returning either the arrays generated by the 2 smallest factors, the 2 largest factors, or the smallest and largest factors. 

The code then uses the two numbers that have been returned from this process to create a grid of frequency values. Along the right, the frequency increases in increments 
decided by the first factor, and as we travel up, the increments depend on the second factor. Every note's frequency is calculated as 2^(n/N), where N is the cardinality 
of the system and n is (r x f1)+(l x f2), where r is the number of rightwards steps, l is the number of leftwards steps, and f1 and f2 are the first and second factors. 

The theory as to *why* this is being done would not fit in a GitHub readme, but it has to do with the Tonnetz of Neo-Riemannian harmony. I'll give a hint through - note that the "chordal" grid in 12-TET is an exact copy of the 12-tone [Tonnetz](https://en.wikipedia.org/wiki/Tonnetz) if one ignores the triangles 
superimposed by theorists who are very concerned about triads :)



## Functionality (How the sound gets to you)
The sound engine behind the user interface is loosely based on classic analog subtractive synthesizers. For those unfamiliar with the basics of subtractive synthesis, Yamaha has published a very comprehensive guide [here](https://yamahasynth.com/learn/synth-programming/subtractive-synthesis-101-part-one-the-basics).

Every time that a key is pressed, one of the internal oscillators is assigned a note value, and is added to the list of notes that are audible. This is the beginning of a chain of digital sound processing that ends in the computer speakers. 

First, the raw audio from the oscillator goes into an amplifier that is controlled by the "Amp Envelope." When a key is pressed, it triggers the Attack and Decay
stages of the envelope, and sustains at the level of the "sustain" slider until the key is released, triggering the Release phase. This behavior
is common to all ADSR envelopes (further reading [here](https://support.apple.com/guide/logicpro/attack-decay-sustain-and-release-lgsife419620/mac)). After passing the 
amplifier, the sound is processed by a digital [low-pass filter](https://mynewmicrophone.com/audio-eq-what-is-a-low-pass-filter-how-do-lpfs-work/)
which has its own independent ADSR envelope that is triggered on every keypress. It will remain at its 
sustain level until every key is released. The filter envelope can be disabled by pressing the "on/off" button, which turns dark when the filter envelope is not enabled. 
The avid synthesist may note that the absence of a filter per voice makes this synthesizer "paraphonic" rather than "polyphonic," at which point I would kindly refer them 
to the source code so they can do it themselves :). 

The sound then passes into the effects section. First, the audio enters a stereo delay. By default, the delay is mono, but engaging the mono/stereo switch (where dark 
is stereo), the delay offers separate controls for the right and left audio channels. The user has control over feedback and the delay time. More information about 
the function of delay units can be found [here](https://www.teachmeaudio.com/mixing/equipment/effects/delay). The delay can be effectively bypassed by setting the feedback
control to the minimum, so no audio is fed back to the delay. Finally, the sound enters a convolution reverb with a dry-wet fader and control over the decay percent 
(essentially how much audio is fed through to the next echo) and the decay time (the characteristic time of an echo). Convolution reverb is complicated, so I refer to the 
[p5 documentation](https://p5js.org/reference/#/p5.Reverb) as to how their reverb works. Finally, the audio is piped out to the computer, and the operating system 
takes care of sending the audio to the listener. 

## CONTRIBUTIONS
Pull requests are welcome, but please open an issue first so I can learn what you would like to edit. 

## KNOWN ISSUES
One major disadvantage of a keyboard layout is that keyboard hardware is often designed in a way that does not support multiple keypresses, so when the user plays groups of notes, they will not fire together. If the app is not letting you play groups of notes, try moving to an external keyboard if one is available. This problem seems to be most common in built-in laptop keyboards.  

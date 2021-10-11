# Grid_Synth
Driver code for a web-based synthesizer written in p5.js

## Using the app
As it stands, this application has been tested on both Google Chrome and Microsoft Edge browsers. In theory, any web browset that supports the
[Web Audio API](https://caniuse.com/audio-api) and [P5.js](https://github.com/processing/p5.js/blob/main/contributor_docs/supported_browsers.md)
should be able to use the application without problems

## Functionality (How the sound gets to you)
As it stands, the sound engine behind the user interface is based on classic analog polyphonic synthesizers. Every time that a key is pressed, 
one of the internal oscillators is assigned a note value, and is added to the list of notes that are audible. This is the beginning of a 
chain of digital sound processing that ends in the computer speakers. 

First, the raw audio from the oscillator goes into an amplifier that is controlled by the "Amp Envelope." When a key is pressed, it triggers the Attack and Decay
stages of the envelope, and sustains at the level of the "sustain" slider until the key is released, triggering the Release phase. This behavior
is common to all ADSR envelopes (further reading [here](https://support.apple.com/guide/logicpro/attack-decay-sustain-and-release-lgsife419620/mac)). After passing the 
amplifier, the sound is processed by a digital [low-pass filter](https://mynewmicrophone.com/audio-eq-what-is-a-low-pass-filter-how-do-lpfs-work/)
which has its own independent ADSR envelope that is triggered on every keypress. It will remain at its 
sustain level until every key is released. The filter envelope can be disabled by pressing the "on/off" button, which turns dark when the filter envelope is not enabled. 

The sound then passes into the effects section. First, the audio enters a stereo delay. By default, the delay is mono, but engaging the mono/stereo switch (where dark 
is stereo), the delay offers separate controls for the right and left audio channels. The user has control over feedback and the delay time. More information about 
the function of delay units can be found [here](https://www.teachmeaudio.com/mixing/equipment/effects/delay). The delay can be effectively bypassed by setting the feedback
control to the minimum, so no audio is fed back to the delay. Finally, the sound enters a convolution reverb with a dry-wet fader and control over the decay percent 
(essentially how much audio is fed through to the next echo) and the decay time (the characteristic time of an echo). Reverb is complicated, so I refer to the 
[p5 documentation](https://p5js.org/reference/#/p5.Reverb) as to how their reverb works. Finally, the audio is piped out to the computer, and the operating system 
takes care of sending the audio to the listener


<!--
## Installation

Use the package manager [pip](https://pip.pypa.io/en/stable/) to install foobar.

```bash
pip install foobar
```

## Usage

```python
import foobar

# returns 'words'
foobar.pluralize('word')

# returns 'geese'
foobar.pluralize('goose')

# returns 'phenomenon'
foobar.singularize('phenomena')
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)
-->

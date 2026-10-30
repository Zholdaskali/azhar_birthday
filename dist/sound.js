/* Original ambient loop synthesized in the browser. No third-party audio or autoplay. */
(() => {
  'use strict';
  let context, master, timer, playing = false, beat = 0, nextTime = 0;
  const voices = new Set();
  const beatLength = 60 / 72;
  const chords = [[48,55,59,64],[45,52,55,60],[41,48,52,57],[43,50,55,59]];
  const melody = [72,null,76,79,null,76,74,null,72,null,71,67,null,69,72,null,
    69,null,72,76,null,74,72,null,71,null,74,79,null,76,74,null];
  const $ = id => document.getElementById(id);
  const paint = () => {
    $('sound-toggle').setAttribute('aria-pressed', String(playing));
    $('sound-toggle').setAttribute('aria-label', playing ? 'Фондық әуенді тоқтату' : 'Фондық әуенді қосу');
    $('sound-label').textContent = playing ? 'әуен ойнап тұр' : 'әуен қосу';
  };
  const volume = () => Number($('sound-volume').value) / 100 * .38;
  function note(midi, when, duration, strength, soft = false) {
    const oscillator = context.createOscillator(); const envelope = context.createGain();
    oscillator.type = 'sine'; oscillator.frequency.value = 440 * 2 ** ((midi - 69) / 12);
    envelope.gain.setValueAtTime(0, when);
    envelope.gain.linearRampToValueAtTime(strength, when + (soft ? .18 : .012));
    envelope.gain.exponentialRampToValueAtTime(.0001, when + duration);
    oscillator.connect(envelope); envelope.connect(master);
    voices.add(oscillator); oscillator.start(when); oscillator.stop(when + duration + .05);
    oscillator.onended = () => { voices.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
    if (!soft) {
      const overtone = context.createOscillator(); const overGain = context.createGain();
      overtone.frequency.value = oscillator.frequency.value * 2;
      overGain.gain.setValueAtTime(strength * .13, when);
      overGain.gain.exponentialRampToValueAtTime(.0001, when + duration * .35);
      overtone.connect(overGain); overGain.connect(master); voices.add(overtone); overtone.start(when); overtone.stop(when + duration);
      overtone.onended = () => { voices.delete(overtone); overtone.disconnect(); overGain.disconnect(); };
    }
  }
  function schedule() {
    if (!playing) return;
    while (nextTime < context.currentTime + .3) {
      const chord = chords[Math.floor(beat / 8) % 4];
      if (beat % 8 === 0) chord.forEach((midi, index) => note(midi, nextTime + index * .06, beatLength * 7.5, .15, true));
      const melodyNote = melody[beat % melody.length];
      if (melodyNote !== null) note(melodyNote, nextTime, 2.1, .12);
      if (beat % 2 === 0) note(chord[(beat / 2) % 4] + 12, nextTime + .12, 1.8, .055);
      beat = (beat + 1) % 32; nextTime += beatLength;
    }
  }
  async function start() {
    try {
      if (!context) {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) throw new Error('Audio unavailable');
        context = new AudioContext(); master = context.createGain(); master.gain.value = 0;
        const filter = context.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 2400;
        const compressor = context.createDynamicsCompressor(); compressor.threshold.value = -20; compressor.ratio.value = 3;
        master.connect(filter); filter.connect(compressor); compressor.connect(context.destination);
      }
      await context.resume();
      if (context.state !== 'running') throw new Error('Audio suspended');
      if (playing) return true;
      playing = true; beat = 0; nextTime = context.currentTime + .05;
      master.gain.cancelScheduledValues(context.currentTime); master.gain.setValueAtTime(0, context.currentTime);
      master.gain.linearRampToValueAtTime(volume(), context.currentTime + .8);
      schedule(); timer = window.setInterval(schedule, 100); paint();
      $('sound-status').textContent = ''; return true;
    } catch {
      playing = false; paint(); $('sound-status').textContent = 'Әуен қосылмады. Қайта басып көр.'; return false;
    }
  }
  function stop() {
    if (!context) return;
    playing = false; window.clearInterval(timer);
    master.gain.cancelScheduledValues(context.currentTime);
    master.gain.setTargetAtTime(0, context.currentTime, .08);
    for (const voice of voices) { try { voice.stop(context.currentTime + .15); } catch {} }
    paint();
  }
  $('sound-toggle').addEventListener('click', () => { if (playing) stop(); else start(); });
  $('sound-volume').addEventListener('input', () => {
    if (context && playing) { master.gain.cancelScheduledValues(context.currentTime); master.gain.setTargetAtTime(volume(), context.currentTime, .06); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden && playing) stop(); });
  window.addEventListener('pagehide', stop);
  window.AzharSound = { start, stop };
  paint();
})();

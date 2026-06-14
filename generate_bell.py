import numpy as np
from scipy.io import wavfile

sample_rate = 44100
t = np.linspace(0, 3, int(sample_rate * 3), endpoint=False)

frequencies = [880.0, 1760.0, 2640.0]
decays = [1.5, 3.0, 4.5]

audio = np.zeros_like(t)

for freq, decay in zip(frequencies, decays):
    envelope = np.exp(-decay * t)
    wave = np.sin(2 * np.pi * freq * t)
    audio += envelope * wave

audio = audio / np.max(np.abs(audio))
audio = np.int16(audio * 32767)

wavfile.write("bell.wav", sample_rate, audio)

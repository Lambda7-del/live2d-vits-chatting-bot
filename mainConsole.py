import vits
ansNet=vits.vitsModel(hp_path="./vits/configs/ru.json", model_path="./vits/models/ru.pth")

from playsound import playsound

import chatGpt.chatgptConeect as cc
chatNet=cc.chatgptContinueConnect()

import re
import text_dealing as td

def playAu(): 
    playsound('cache/audio/audio.wav')

while True: 
    print('You: ')
    N=input()
    rep=chatNet.reply(N)
    # rep=re.sub(r'\n','',rep)
    rep=rep[2:]
    rep=td.select_lang_mode(rep)
    print('Her: ')
    print(rep)
    ansNet.text_to_audio(text=rep, speaker_id=94)
    playAu()

import vits
ansNet=vits.vitsModel(hp_path="./vits/configs/ru.json", model_path="./vits/models/ru.pth")
sid=94

from playsound import playsound

import chatGpt.chatgptConeect as cc
chatNet=cc.chatgptContinueConnect()

import text_dealing as td

def playAu(): 
    playsound('cache/audio/audio.wav')

from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/echo/<text>')
def echo(text):
    return jsonify(f'you input text is {text}')

@app.route('/chatting/<text>')
def chatting(text):
    rep=chatNet.reply(text)
    return jsonify(rep)

@app.route('/voice/<text>')
def voice(text): 
    text=td.select_lang_mode(text)
    ansNet.text_to_audio(text=text, speaker_id=sid)
    playAu()
    return jsonify(text)

@app.route('/changeVitsNet/<text>')
def changeVitsNet(text): 
    global ansNet
    hp="./vits/configs/"+text+".json"
    mp="./vits/models/"+text+".pth"
    ansNet=vits.vitsModel(hp_path=hp, model_path=mp)
    return jsonify(text)

@app.route('/changeApiKey/<text>')
def changeApiKey(text): 
    cc.changeApiKey(text)
    return jsonify(text)

@app.route('/changeSid/<speaker>')
def changeSid(speaker): 
    global sid
    sid=int(speaker)
    return jsonify(speaker)

if __name__ == '__main__':
    port = 7777
    host = '0.0.0.0'
    app.run(host,port=port)
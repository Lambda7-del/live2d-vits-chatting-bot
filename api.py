import vits
ansNet=vits.vitsModel(hp_path="./vits/configs/ru.json", model_path="./vits/models/ru.pth")

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
    return jsonify(f'you input text is 啊嘎嘎 {text}')

@app.route('/chatting/<text>')
def chatting(text):
    rep=chatNet.reply(text)
    return jsonify(rep)

@app.route('/voice/<text>/<id>')
def voice(text, id): 
    text=td.select_lang_mode(text)
    ansNet.text_to_audio(text=text, speaker_id=int(id))
    playAu()

if __name__ == '__main__':
    port = 7777
    host = '0.0.0.0'
    app.run(host,port=port)
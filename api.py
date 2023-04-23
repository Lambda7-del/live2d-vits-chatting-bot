import vits
import os
def load_models(): 
    root='./vits/models/'
    modelList={}
    for path, file_dir, files in os.walk(root):
        for file_name in files:
            modelList[file_name[:-4]]=0
    root='./vits/configs/'
    configList={}
    for path, file_dir, files in os.walk(root):
        for file_name in files:
            configList[file_name[:-5]]=0
    ans=''
    for k, v in configList.items(): 
        if k in modelList: 
            ans=k
            break
    return ans
startVits=load_models()
ansNet=None # vits model
if startVits!='': 
    hp="./vits/configs/"+startVits+".json"
    mp="./vits/models/"+startVits+".pth"
    ansNet=vits.vitsModel(hp_path=hp, model_path=mp)
sid=0

from playsound import playsound

import chatGpt.chatgptConeect as cc
import json
def load_api_keys(): 
    path='./chatGpt/openai_api_key.json'
    with open(path) as f: 
        data = json.load(f)
    if len(data["keys"])>0: 
        cc.changeApiKey(data["keys"][0])
load_api_keys()
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
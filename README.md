# live2d-vits-chatting-bot
Try to build a chatting-bot with gpt, vits and live2d. 

This project includes: 
1. Live2d pet in desktop
2. Chatting-bot based on gpt from openai
3. Transform text into voice of different character based on VITS

# reference
[1] https://github.com/CjangCjengh/vits  
[2] https://github.com/MikuNyanya/live2dPet_windows  
[3] https://github.com/Eikanya/Live2d-model

# How to use
## Environment setting
### Download the project.  
```sh
git clone XXX
```
### Node.js
Move in project directory and install **electron** and **@electron.remote**. 
``` sh
npm install electron --save-dev
npm install @electron/remote --save-dev
```
### Python
Install python package. The torch for cuda may need to be install through downloading wheel. 
```sh
pip install -r requirements.txt
```
## File setting
### live2d model
Live2d model can be download in ref.[3]. And live2d model should be saved at **/live2d/model/**. A **size.json** need to be added in each model, or the size of model could not be obtained. If the size is unknown, user can try different value to adjust it until it performs well. 

The structure of **size.json** (example: live2d/model/sagiri/size.json): 
```
{
    "width": 300, 
    "height": 600
}
```
### vits model
Vits model could transform text into human voice. A Vits model includes **vits.pth** and **vits.json**. **vits.pth** should be save at **/vits/model/** and **vits.json** should be save at **/vits/configs**. **vits.pth** and **vits.json** of the same vits model should have same name. 
### gpt api-key
OpenAI api-key could to be applied at OpenAI officail website for free. Add your own api-key at **chatGpt/openai_api_key.json**. 
```
{
    "keys": ["sk-vJGGvjcIric8ZJkAIT3BlbkFv9DWWzzM3pUQCDv"]
}
```
## start
Transform your python environment. If you install **requirement** at anaconda env **base**, this step could be ignored. 
``` sh
conda activate XXX
```
Start program
```
npm start
```

# live2d
## intro
Based on electron/node.js, with live2d.js, live2d interface is built. In this section, live2d interface is rebuilt from ref.[1] Live2d model can be collected at ref.[3] or some other websites, or created by professtional tools. 

## env
1. node.js is needed. v18.15.0
2. Install **electron**, **@electron/remote** with **npm** or **cnpm**. electron v24.1.12, @electron/remote v2.0.9

## function (updating)
1. Show live2d animation on desk without frame. (Thanks to ref.[1])
2. Show special message on live2d, which can be hidden by hidden button. (Thanks to ref.[1])
3. Show chatting module, where user can send message to chatting bot and get reply. 
4. Dragging windows. 
5. quit is only allowed by tray. 
6. Change live2d model. Live2d model should be saved at folder **/live2d/model**. And a **size.josn** needed to be added. Live2d model can be collected at ref.[3] or some other websites, or created by professtional tools. 

# vits
## intro
Based on python/pytorch. vits is a deep learning network, which is train to transform text sequence into voice of certain speaker. In this section, 'class vits' is rebuilt from ref.[2] and training module is removed. Several pre-trained vits models are collected from internet and used

A vits model includes 'config.json' and 'model.pth'. 'config.json' is saved at /vits/configs/, 'model.pth' is saved at /vits/models/, and rename them as same name. 

## env
1. python 3.9.16
2. torch 1.13.1+cu117
3. some necessary python package in requirement.txt
4. extra python package: playsound, langid

## function (updating)
1. Identify Chinese, English and Japanese from text sequence. 
2. Transform text of Chinese, English and Japanese into 'audio.wav' of certain voice with certain 'model.pth'. (Thanks to ref.[2])
3. Play audio. 
4. Connected with **gpt** module, get reply text from **gpt** and transform it into voice. 
5. An interface based on thinter is built, where user can choose vits model, speaker. Start with **test.py**. 

# gpt
## intro
Key part of chatting-bot. Now chatgpt-turbo from openai is used. An **api-key** of openai is needed to connect chatgpt-turbo to build a chatting system. And due to region, connection might not be built. (So how to connect to chatgpt?It is hard to explain. Even though I explain, some may still not understand. If I explain, and you get it, then explaination is not needed). 

The api-key here is useless, save effective api-key in /chatGpt/openai_api_key.json, and change it in chatGpt/chatgptConnect.py

This module probably would be changed because chatgpt may become expensive in the future. 

## env
1. python 3.9.16
2. python package: openai

## function (updating)
1. Chatting with chatgpt-3.5
2. Connected with **vits** module, transport reply text to **vits** module and get voice. 
3. An interface based on thinter is built, where user can input text and get reply from chatting-bot and choose **api-key** of openai. 

# test
1. total process: start with package.json, npm start. 
2. gpt-vits only: python test.py

# now process
Connection among **vits**, **gpt** and **live2d** is built. 
Choose vits-model, live2d-model, speaker-id and api-key in setting window. 

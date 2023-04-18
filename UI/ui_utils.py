import json
import os

# 加载api_key文件，返回list
def load_api_keys(): 
    path='./chatGpt/openai_api_key.json'
    with open(path) as f: 
        data = json.load(f)
    return data["keys"]

# 加载model文件
def load_models(): 
    root='./vits/models/'
    modelList=[]
    for path, file_dir, files in os.walk(root):
        for file_name in files:
            modelList.append(file_name[:-4])
    return modelList

# 加载speaker
def load_speaker(file: str): 
    with open(file, 'r', encoding='UTF-8') as f: 
        data = json.load(f)
    speakers=data['speakers']
    if isinstance(speakers, dict): 
        return speakers
    else: 
        ans={}
        for i in range(len(speakers)): 
            ans[speakers[i]]=i
        return ans

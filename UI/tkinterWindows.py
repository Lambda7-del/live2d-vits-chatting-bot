import tkinter
from tkinter.ttk import *
from tkinter import scrolledtext
from . import ui_utils as uu
import chatGpt.chatgptConeect as cc
import vits
import re
import text_dealing as td
from playsound import playsound
from threading import Thread

def playAu(): 
    playsound('cache/audio/audio.wav')

class singleWindow(): 
    def __init__(self) -> None:
        self.api_key=""
        self.vits_model_str=""
        self.top=tkinter.Tk()
        self.top.title('chatting setting')
        self.top.geometry("400x700")
        self.set_api_key_selected_combox()
        self.set_model_selected_combox()
        self.api_key=self.api_key
        cc.changeApiKey(self.api_key)
        # self.chatGpt=cc.chatgptConnect()
        self.chatGpt=cc.chatgptContinueConnect()
        self.vits_model_str=self.vits_model_str
        self.model_path='./vits/models/'+self.vits_model_str+'.pth'
        self.config_path='./vits/configs/'+self.vits_model_str+'.json'
        self.speakers=uu.load_speaker(self.config_path)
        self.load_vits()
        self.speaker_id=0
        self.speakerListCombo=self.set_speakerid_combo()
        self.role='user'
        self.set_role_selected_combox()
        self.txtChatting=self.set_chatting_box()
        self.input_box=self.set_input_box()
        self.set_send_button()

    def load_vits(self): 
        try: 
            self.vits_model=vits.vitsModel(hp_path=self.config_path, model_path=self.model_path)
        except: 
            print('load vits model fail!!check file name')

    def set_api_key_selected_combox(self): 
        lbl=Label(self.top, text='open ai api key')
        lbl.pack(padx=5, pady=10)
        key_data=uu.load_api_keys()
        combo = Combobox(self.top, width=50)
        combo['value']=key_data
        combo.current(0)
        combo.pack(padx=5, pady=0)
        combo.configure(state="readonly")
        self.api_key=combo.get()
        def changeKey(event): 
            newKey=combo.get()
            self.api_key=newKey
        combo.bind('<<ComboboxSelected>>', changeKey)

    def set_model_selected_combox(self): 
        lbl=Label(self.top, text='vits model')
        lbl.pack(padx=5, pady=10)
        model_data=uu.load_models()
        combo = Combobox(self.top, width=50)
        combo['value']=model_data
        combo.current(0)
        combo.pack(padx=5, pady=0)
        combo.configure(state="readonly")
        self.vits_model_str=combo.get()
        def changeModel(event): 
            newModel=combo.get()
            self.vits_model_str=newModel
            self.model_path='./vits/models/'+self.vits_model_str+'.pth'
            self.config_path='./vits/configs/'+self.vits_model_str+'.json'
            self.speakers=uu.load_speaker(self.config_path)
            self.load_vits()
            speakers=[]
            for k, v in self.speakers.items(): 
                speakers.append(k)
            self.speakerListCombo['value']=speakers
            self.speakerListCombo.current(0)
            self.speaker_id=0
        combo.bind('<<ComboboxSelected>>', changeModel)

    def set_speakerid_combo(self): 
        lbl=Label(self.top, text='speaker')
        lbl.pack(padx=5, pady=10)
        speakers=[]
        for k, v in self.speakers.items(): 
            speakers.append(k)
        combo = Combobox(self.top, width=50)
        combo['value']=speakers
        combo.current(0)
        combo.pack(padx=5, pady=0)
        combo.configure(state="readonly")
        self.speaker_id=self.speakers[combo.get()]
        def changeSpeaker(event): 
            self.speaker_id=self.speakers[combo.get()]
        combo.bind('<<ComboboxSelected>>', changeSpeaker)

        return combo
    
    def set_role_selected_combox(self): 
        lbl=Label(self.top, text='role')
        lbl.pack(padx=5, pady=10)
        combo = Combobox(self.top, width=50)
        combo['value']=['user', 'system']
        combo.current(0)
        combo.pack(padx=5, pady=0)
        combo.configure(state="readonly")
        def changeRole(event): 
            newRole=combo.get()
            self.role=newRole
        combo.bind('<<ComboboxSelected>>', changeRole)

    def set_chatting_box(self): 
        lbl=Label(self.top, text='dialect')
        lbl.pack(padx=5, pady=10)
        txt = scrolledtext.ScrolledText(self.top, width=50, height=20)
        txt.insert("insert", "You: \n")
        txt.configure(state='disabled')
        txt.pack(padx=5, pady=0)
        return txt
    
    def set_input_box(self): 
        input_box=scrolledtext.ScrolledText(self.top, width=50, height=5)
        input_box.pack(padx=5, pady=0)
        return input_box
    
    def set_send_button(self): 
        def buttonfunc(): 
            input_txt=self.input_box.get(1.0,'end')
            input_txt=re.sub(r'\n','',input_txt)
            self.input_box.delete('1.0', tkinter.END)
            self.txtChatting.configure(state='normal')
            self.txtChatting.insert("insert", input_txt+"\n\nHer: \n")
            self.txtChatting.configure(state='disabled')
            self.input_box.configure(state='disabled')
            def replyWait(): 
                self.txtChatting.configure(state='normal')
                input_role=self.role
                rep=self.chatGpt.reply(input=input_txt, role=input_role)
                # rep=re.sub(r'\n','',rep)
                # rep=rep[2:]
                rep=td.select_lang_mode(rep)
                self.txtChatting.insert("insert", rep+"\n\nYou: \n")
                self.txtChatting.see(tkinter.END)
                self.txtChatting.configure(state='disabled')
                def playSound(text=rep, speaker_id=self.speaker_id): 
                    self.vits_model.text_to_audio(text=text, speaker_id=speaker_id)
                    playAu()
                    self.input_box.configure(state='normal')
                p = Thread(target=playSound, args=(rep, self.speaker_id))
                p.start()
            p0=Thread(target=replyWait)
            p0.start()
            
            
        send_button=Button(self.top, text='send', command=buttonfunc)
        send_button.pack(padx=5, pady=0)


    def start_window(self): 
        self.top.mainloop()

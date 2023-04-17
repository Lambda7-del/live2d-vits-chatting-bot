var chattingText=[{'user': 'TA', 'time': '??:??', 'text': '始まるよ～'}, {'user': 'ME', 'time': '??:??', 'text': '喜多'}, {'user': 'TA', 'time': '??:??', 'text': '郁代'}];
var ifShowingChatting=false; 

// chatting-button功能
(function (){
    $('.chatting-button').fadeOut(0).on('click', () => {
        if(ifShowingChatting) {
            ipcRenderer.send("closeChatting"); 
            ifShowingChatting=false; 
        }
        else {
            ipcRenderer.send("openChatting", chattingText); 
            ifShowingChatting=true; 
        }
    }); 
    $('#landlord').hover(() => {
        $('.chatting-button').fadeIn(600); 
    }, () => {
        $('.chatting-button').fadeOut(600); 
    }); 
})(); 

//ipc监听，添加chattingText
ipcRenderer.on("push_chattingText", (event, data) => {
    chattingText.push(data); 
})

//ipc监听，来自close按键的关闭chatting
ipcRenderer.on("closeChatting", (event) => {
    ifShowingChatting=false; 
})

var ifShowingChatting=false; 

// chatting-button功能
(function (){
    $('.chatting-button').fadeOut(0).on('click', () => {
        if(ifShowingChatting) {
            ipcRenderer.send("closeChatting"); 
            ifShowingChatting=false; 
        }
        else {
            ipcRenderer.send("openChatting"); 
            ifShowingChatting=true; 
        }
    }); 
    $('#landlord').hover(() => {
        $('.chatting-button').fadeIn(600); 
    }, () => {
        $('.chatting-button').fadeOut(600); 
    }); 
})(); 

//ipc监听，来自close按键的关闭chatting
ipcRenderer.on("closeChatting", (event) => {
    ifShowingChatting=false; 
})

//获取remote
const remote = require('@electron/remote');
//获取screen模块
const screen = remote.screen;

const ipcRenderer = require("electron").ipcRenderer; 

window.onload = function () {
    //窗口拖动
    makeDraggable();
}

function sending() {
    // 成功发送
    var send_message=document.getElementById("chat_middle_item");
    var domBtm=document.getElementById("send_button");
    // 发送内容
    var message=document.getElementById("chat_context_item");
    domBtm.addEventListener("click",function(){
        var str=message.value;
        if(str.length>0) {
            var date=new Date();
            var hour=date.getHours();
            var mm=date.getMinutes();
            if(mm<10) var time=hour+':0'+mm;
            else var time=hour+':'+mm;
            var ans='<div class="chat_right_item_1 clearfix">ME</div>'+
                '<div class="chat_right_item_2">'+
                    '<div class="chat_right_time clearfix">'+time+'</div>'+
                    '<div class="chat_right_content clearfix">'+str+'</div>'
                    +'</div>';
            var oLi=document.createElement("div");
            oLi.setAttribute("class","chat_right");
            oLi.innerHTML=ans;
            send_message.append(oLi);
            message.value="";
            // 保存信息
            ipcRenderer.send("push_chattingText", {'user': 'ME', 'time': time, 'text': str}); 
            // 滚动到底
            send_message.scrollTop = send_message.scrollHeight;
            getReply(str); 
        }
    });
    // 滚动到底
    var element = document.getElementById("chat_middle_item");
    element.scrollTop = element.scrollHeight;
}

//获取回复
function getReply(str) {
    fetch('http://localhost:7777/chatting/'+str)
        .then(response => response.json())
        .then(data => {
            showReply(data); 
        })
}

//语音功能
function getVoice(str) {
    fetch('http://localhost:7777/voice/'+str); 
}

//显示回复
function showReply(str) {
    if(str.length>0) {
        var reply_message=document.getElementById("chat_middle_item");
        var date=new Date();
        var hour=date.getHours();
        var mm=date.getMinutes();
        if(mm<10) var time=hour+':0'+mm;
        else var time=hour+':'+mm;
        var ans='<div class="chat_left_item_1 clearfix">TA</div>'+
            '<div class="chat_left_item_2">'+
                '<div class="chat_left_time clearfix">'+time+'</div>'+
                '<div class="chat_left_content clearfix">'+str+'</div>'
                +'</div>';
        var oLi=document.createElement("div");
        oLi.setAttribute("class","chat_left");
        oLi.innerHTML=ans;
        reply_message.append(oLi);
        // 保存信息
        ipcRenderer.send("push_chattingText", {'user': 'TA', 'time': time, 'text': str}); 
        // 滚动到底
        reply_message.scrollTop = reply_message.scrollHeight;
        //语音播报
        getVoice(str); 
    }
}

function showChatting(chattingText) {
    textBox=$('#chat_middle_item');
    textChatting='';
    for (i = 0; i < chattingText.length; i++) { 
        if(chattingText[i]['user']=='TA') {
            textChatting+='<div class="chat_left clearfix"><div class="chat_left_item_1 ">TA</div><div class="chat_left_item_2"><div class="chat_time">'+chattingText[i]['time']+'</div><div class="chat_left_content">'+chattingText[i]['text']+'</div></div></div>';
        }
        else {
            textChatting+='<div class="chat_right"><div class="chat_right_item_1 ">ME</div><div class="chat_right_item_2 "><div class="chat_right_time">'+chattingText[i]['time']+'</div><div class="chat_right_content">'+chattingText[i]['text']+'</div></div></div>';
        }
    }
    textBox.html(textChatting); 
    sending(); 
}

//该拖拽方法有个问题，鼠标甩的太快的时候，会由于鼠标脱离了窗体区域而导致触发不了鼠标移动事件，从而移动中断
//不过通过window.addeventlistener全局拖拽监听解决
function makeDraggable() {
    var chat_top = this.document.querySelector(".chat_top");
    //指示正在执行拖动操作
    let dragging = false;
    //指示鼠标左键是否按下
    let mousedown_left = false;
    let mouseOnPage;
    chat_top.addEventListener('mousedown', (e) => {
        if (e.button == 0) {
            //鼠标左键
            mousedown_left = true;
        }
        // if(e.button == 1) //鼠标中键(滚轮)
        // if(e.button == 2) //鼠标右键

        //记录当前窗口中的鼠标相对位置
        //获取鼠标位置
        const { x, y } = screen.getCursorScreenPoint();
        //从主进程获取当前窗口位置
        const pos = ipcRenderer.sendSync('getChattingWinPoint')
        //计算鼠标相对于窗口位置
        mouseOnPage = [(x - pos[0]), (y - pos[1])]

        // console.log("鼠标左键坐标:" + x + " " + y)
        // console.log("窗口坐标:" + pos)
        // console.log("鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])
    });
    chat_top.addEventListener('mouseup', () => {
        mousedown_left = false;
        dragging = false;
    });
    window.addEventListener('mousemove', () => {
        //按下鼠标并移动，判定为拖动窗口
        if (mousedown_left) {
            dragging = true;
        }

        //执行拖动操作
        if (dragging) {
            //移动窗口操作发送到主进程进行
            ipcRenderer.send('dragChattingWin', mouseOnPage)
        }
    });
}

//关闭键功能
(function (){
    $('#close_button').on('click', () => {
        ipcRenderer.send("closeChatting"); 
    }); 
})(); 

//ipc监听，打开chatting窗口
ipcRenderer.on("openChatting", (event, data) => {
    showChatting(data); 
}); 

const ipcRenderer = require("electron").ipcRenderer; 
//获取remote
const remote = require('@electron/remote');
//获取screen模块
const screen = remote.screen;

//更换vits
async function changeVits(model, model_id) {
    fetch('http://localhost:7777/changeVitsNet/'+model); 
    ipcRenderer.send("changeVits", model_id); 
}

//更换api-key
async function changeApiKey(key, key_id) {
    fetch('http://localhost:7777/changeApiKey/'+key); 
    ipcRenderer.send("changeApiKey", key_id); 
}

//更换speaker
async function changeSpeaker(sid) {
    fetch('http://localhost:7777/changeSid/'+sid); 
    ipcRenderer.send("changeSpeaker", sid); 
}

//显示各项
function showItem() {
    var fs = require('fs');
    //遍历vits模型
    var configs={}; 
    var models={}; 
    var filePath=__dirname+'/../vits/configs/'; 
    var textIn=''; 
    var index=0; 
    let files=fs.readdirSync(filePath); 
    for(item in files) {
        let stat=fs.statSync(filePath+files[item]); 
        if(stat.isFile()) {
            configs[files[item].split('.')[0]]=0;
        }
    }
    filePath=__dirname+'/../vits/models/'; 
    fs.readdirSync(filePath);
    files=fs.readdirSync(filePath); 
    for(item in files) {
        let stat=fs.statSync(filePath+files[item]); 
        if(stat.isFile()) {
            models[files[item].split('.')[0]]=0;
        }
    }
    for(var key in configs) {
        if(key in models) {
            textIn+="<option class='option' id=v"+index+" value="+index+">"+key.split('.')[0]+"</option>"; 
            index++; 
        }
    }
    $("#vits-se").html(textIn); 
    //遍历live2d
    filePath=__dirname+'/../live2d/model/'; 
    textIn=''; 
    index=0; 
    fs.readdirSync(filePath);
    files=fs.readdirSync(filePath); 
    for(item in files) {
        let stat=fs.statSync(filePath+files[item]); 
        if(stat.isDirectory()) {
            textIn+="<option class='option' id=l"+index+" value="+index+">"+files[item]+"</option>"; 
            index++; 
        }
    }
    $("#live2d-se").html(textIn); 
    //遍历api-key
    let data = fs.readFileSync('./chatGpt/openai_api_key.json', 'utf8');
    // parse JSON string to JSON object
    let config = JSON.parse(data);
    index=0; 
    var keyList=config.keys; 
    textIn=''
    for(var i=0; i<keyList.length; i++) {
        textIn+="<option class='option' id=k"+index+" value="+index+">"+keyList[i]+"</option>"; 
        index++; 
    }
    $("#api-key-se").html(textIn); 
    ipcRenderer.send("settingMoren"); 
}

//设置显示默认值
function morenShow(morenKey, morenVits, morenSpeaker, morenLive2d) {
    $("#k"+morenKey).attr("selected", true); 
    $("#v"+morenVits).attr("selected", true); 
    $("#l"+morenLive2d).attr("selected", true); 
    vitsName=$("#v"+morenVits).html(); 
    var fs = require('fs');
    let data = fs.readFileSync('./vits/configs/'+vitsName+'.json', 'utf8');
    // parse JSON string to JSON object
    let config = JSON.parse(data); 
    var index=0; 
    var speList=config.speakers; 
    var textIn=''; 
    for(item in speList) {
        textIn+="<option class='option' id=s"+index+" value="+index+">"+item+"</option>"; 
        index++; 
    }
    $("#speaker-se").html(textIn); 
    $("#s"+morenSpeaker).attr("selected", true); 
}

//select选择后api-key变化
$("#api-key-se").on("change", () => {
    //更改api-key
    var newKey=$("#api-key-se option:selected").text(); 
    var newKey_id=$("#api-key-se option:selected").val(); 
    changeApiKey(newKey, newKey_id); 
}); 

//select选择vits后speaker变化
$("#vits-se").on("change", () => {
    var newKey=$("#vits-se option:selected").text();  
    var newKey_id=$("#vits-se option:selected").val(); 
    changeVits(newKey, newKey_id); 
    var fs = require('fs');
    let data = fs.readFileSync('./vits/configs/'+newKey+'.json', 'utf8');
    let config = JSON.parse(data); 
    var index=0; 
    var speList=config.speakers; 
    var textIn=''; 
    for(item in speList) {
        textIn+="<option class='option' id=s"+index+" value="+index+">"+item+"</option>"; 
        index+=1; 
    }
    $("#speaker-se").html(textIn); 
    $("#s0").attr("selected", true); 
}); 

//select选择后sid变化
$("#speaker-se").on("change", () => {
    //更改speaker
    var newSid=$("#speaker-se option:selected").val(); 
    changeSpeaker(newSid); 
}); 

//select选择后live2d变化
$("#live2d-se").on("change", () => {
    //更改live2d
    var newLive2d=$("#live2d-se option:selected").text(); 
    var newLive2d_id=$("#live2d-se option:selected").val(); 
    ipcRenderer.send("changelive2d", [newLive2d, newLive2d_id]); 
}); 

//确认键
(function (){
    $('#apply').on('click', () => {
        ipcRenderer.send("closeSetting"); 
    }); 
})(); 

//关闭键功能
(function (){
    $('#close_button').on('click', () => {
        ipcRenderer.send("closeSetting"); 
    }); 
})(); 

//ipc监听，显示默认值
ipcRenderer.on("settingMoren", (event, data) => {
    morenShow(data[0], data[1], data[2], data[3]); 
})

showItem(); 

window.onload = function () {
    //是否为开始界面，若是则执行初始化
    var url = location.search; //获取url中"?“符后的字串
    if (url.indexOf("?") != -1) {
        var str = url.substr(1);
        var start = decodeURIComponent(str.replace("start=",""));//获取url中的id
        if(start=="0") {
            //更改live2d
            var newLive2d=$("#live2d-se option:selected").text(); 
            var newLive2d_id=$("#live2d-se option:selected").val(); 
            ipcRenderer.send("changelive2d", [newLive2d, newLive2d_id]); 
        }
    }
    makeDraggable(); 
}

//该拖拽方法有个问题，鼠标甩的太快的时候，会由于鼠标脱离了窗体区域而导致触发不了鼠标移动事件，从而移动中断
//不过通过window.addeventlistener全局拖拽监听解决
function makeDraggable() {
    var top = this.document.querySelector(".top");
    //指示正在执行拖动操作
    let dragging = false;
    //指示鼠标左键是否按下
    let mousedown_left = false;
    let mouseOnPage;
    top.addEventListener('mousedown', (e) => {
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
        const pos = ipcRenderer.sendSync('getSettingWinPoint')
        //计算鼠标相对于窗口位置
        mouseOnPage = [(x - pos[0]), (y - pos[1])]

        // console.log("鼠标左键坐标:" + x + " " + y)
        // console.log("窗口坐标:" + pos)
        // console.log("鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])
    });
    top.addEventListener('mouseup', () => {
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
            ipcRenderer.send('dragSettingWin', mouseOnPage)
        }
    });
}
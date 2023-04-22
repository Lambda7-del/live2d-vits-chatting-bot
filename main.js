const electron = require('electron')

//electron app
const app = electron.app
//electron窗口
const BrowserWindow = electron.BrowserWindow
//electron ipc通讯 主进程
const ipcMain = electron.ipcMain
//electron 菜单
const Menu = electron.Menu
//electron 系统托盘
const Tray = electron.Tray
//electron screen
const screen_main = electron.screen;

const path = require('path')
require('@electron/remote/main').initialize(); 

//settingWin默认项
var morenKey="0"; 
var morenVits="0"; 
var morenSpeaker="0"; 
var morenLive2d="0"; 

//live2d窗口大小
const livd2d_width=350; 
const live2d_height=350; 

//chatting窗口大小
const chatting_width=480; 
const chatting_height=680; 

//setting窗口大小
const setting_width=480; 
const setting_height=430; 

//主窗口对象
var mainWindow = null
//chatting窗口对象
var chattingWin = null
//setting窗口对象
var settingWin = null
//系统托盘对象
var appTray = null

//chattingWin与mainWin脱离
var ifFreeChattingWin=true

//APP初始化加载
app.on('ready', () => {
    showMainWin()

    //系统托盘右键菜单
    var trayMenuTemplate = [
        {
            label: '设置',
            click: function () {
                //打开设置页面
                showSettingWin(); 
            }
        },
        {
            label: '关于',
            click: function () {
                //弹出一个窗口，内容为作品，作者描述
            }
        },
        {
            label: '退出',
            click: function () {
                //退出程序
                app.quit();
            }
        }
    ];
    //系统托盘图标目录
    appTray = new Tray(path.join(__dirname, './live2d/image/main_ico.ico'));
    //设置此托盘图标的悬停提示内容
    appTray.setToolTip('这是个系统托盘');
    //图标的上下文菜单
    const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
    //设置此图标的上下文菜单
    appTray.setContextMenu(contextMenu);

    //开启后端python
    startPython()
})

//ipc监听，拖拽主窗体
ipcMain.on('dragMain', (event, mouseOnPage) => {
    //1.获取鼠标新位置
    const { x, y } = screen_main.getCursorScreenPoint();
    // console.log("鼠标新左键坐标:" + x + " " + y)
    // console.log("接收鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])

    //2.计算窗口新坐标
    let newWinPointX = x - mouseOnPage[0];
    let newWinPointY = y - mouseOnPage[1];

    //3.禁止超出屏幕
    //获取桌面大小
    let size = screen_main.getPrimaryDisplay().workAreaSize
    //获取窗口大小
    let winSize = mainWindow.getSize()
    //窗口四个代表性边缘坐标值
    //上边
    let winPoint_up_y = newWinPointY;
    //下边
    let winPoint_down_y = newWinPointY + winSize[1]
    //左边
    let winPoint_left_x = newWinPointX
    //右边
    let winPoint_right_x = newWinPointX + winSize[0]

    //窗口上方超出屏幕，重置Y为0
    if (winPoint_up_y < 0) {
        newWinPointY = 0;
    }
    //窗口下方超出屏幕，重置Y为 屏幕高度最大值 - 窗口高度
    if (winPoint_down_y > size.height) {
        newWinPointY = size.height - winSize[1];
    }
    //窗口左边超出屏幕，重置X为0
    if (winPoint_left_x < 0) {
        newWinPointX = 0;
    }
    //窗口左边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
    if (winPoint_right_x > size.width) {
        newWinPointX = size.width - winSize[0];
    }

    //4.移动窗口
    mainWindow.setPosition(newWinPointX, newWinPointY);
    mainWindow.setSize(livd2d_width, live2d_height)
    mainWindow.transparent = true;

    //5.chattingWin非脱离情况下移动chattingWin
    if(ifFreeChattingWin==false) {
        let startX = newWinPointX-chatting_width-5; 
        let startY = newWinPointY-(chatting_height-live2d_height); 
        if(startX<0) {
            startX=newWinPointX+livd2d_width+5; 
        }
        if(startX+chatting_width>size.width) {
            startX = newWinPointX-chatting_width-5; 
        }
        if(startY<0) {
            startY=0; 
        }
        chattingWin.setPosition(startX, startY);
        chattingWin.setSize(chatting_width, chatting_height); 
        chattingWin.transparent = true;
    }
})

//ipc监听，获取主窗体位置
ipcMain.on('getMainPoint', (event, msg) => {
    const pos = mainWindow.getPosition();
    event.returnValue = pos;
})

//ipc监听，拖拽chattingWin
ipcMain.on('dragChattingWin', (event, mouseOnPage) => {
    ifFreeChattingWin=true; //单独拖动chattingWin后，分离mainWin与chattingWin
    //1.获取鼠标新位置
    const { x, y } = screen_main.getCursorScreenPoint();
    // console.log("鼠标新左键坐标:" + x + " " + y)
    // console.log("接收鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])

    //2.计算窗口新坐标
    let newWinPointX = x - mouseOnPage[0];
    let newWinPointY = y - mouseOnPage[1];

    //3.禁止超出屏幕
    //获取桌面大小
    let size = screen_main.getPrimaryDisplay().workAreaSize
    //获取窗口大小
    let winSize = chattingWin.getSize()
    //窗口四个代表性边缘坐标值
    //上边
    let winPoint_up_y = newWinPointY;
    //下边
    let winPoint_down_y = newWinPointY + winSize[1]
    //左边
    let winPoint_left_x = newWinPointX
    //右边
    let winPoint_right_x = newWinPointX + winSize[0]

    //窗口上方超出屏幕，重置Y为0
    if (winPoint_up_y < 0) {
        newWinPointY = 0;
    }
    //窗口下方超出屏幕，重置Y为 屏幕高度最大值 - 窗口高度
    if (winPoint_down_y > size.height) {
        newWinPointY = size.height - winSize[1];
    }
    //窗口左边超出屏幕，重置X为0
    if (winPoint_left_x < 0) {
        newWinPointX = 0;
    }
    //窗口左边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
    if (winPoint_right_x > size.width) {
        newWinPointX = size.width - winSize[0];
    }

    //4.移动窗口
    chattingWin.setPosition(newWinPointX, newWinPointY);
    chattingWin.setSize(chatting_width, chatting_height); 
    chattingWin.transparent = true;
})

//ipc监听，获取chattingWin位置
ipcMain.on('getChattingWinPoint', (event, msg) => {
    const pos = chattingWin.getPosition();
    event.returnValue = pos;
})

//ipc监听，打开chattingBox
ipcMain.on('openChatting', (event, data) => {
    showChattingWin(data); 
    ifFreeChattingWin=false; //启动chattingWin后，连接chattingWin与mainWin
})

//ipc监听，关闭chattingBox
ipcMain.on("closeChatting", (event) => {
    ifFreeChattingWin=true; //关闭chattingWin时，断开chattingWin与mainWin
    chattingWin.close(); 
    mainWindow.webContents.send("closeChatting"); 
})

//ipc监听，保存对话记录
ipcMain.on("push_chattingText", (event, data )=> {
    // 发送消息给渲染进程mainWindow
    mainWindow.webContents.send("push_chattingText", data); 
})

//ipc监听，更改vits模型
ipcMain.on("changeVits", (event, data) => {
    morenVits=data; 
})

//ipc监听，更改speaker
ipcMain.on("changeSpeaker", (event, data) => {
    console.log(data); 
    morenSpeaker=data; 
})

//ipc监听，更改api-key
ipcMain.on("changeApiKey", (event, data) => {
    morenKey=data; 
})

//ipc监听，设置setting默认值
ipcMain.on("settingMoren", (event) => {
    if(settingWin!=null) {
        settingWin.webContents.send("settingMoren", [morenKey, morenVits, morenSpeaker, morenLive2d]); 
    }
})

//ipc监听，关闭setting窗口
ipcMain.on("closeSetting", (event) => {
    settingWin.close(); 
})

//创建mainWindow
function showMainWin() {
    //设置主窗口
    mainWindow = new BrowserWindow({
        width: livd2d_width, height: live2d_height,
        frame: false,                //去掉窗口边框和标题栏
        // backgroundColor: "#fff",     //背景色
        //窗体透明属性，实际使用时发现如果窗体一部分，从拐角移出屏幕，再移回来，移出去的透明部分会变黑色
        //如果把整个窗体全染黑，就会回归透明，并且不会再出现染黑现象，原因不明，解决方法不明
        transparent: true,          //窗口透明
        skipTaskbar: true,          //任务栏不显示图标
        resizable: true,            //是否允许改变窗口尺寸
        alwaysOnTop: true,          //窗口是否总是在最前端
        webPreferences: {
            nodeIntegration: true,      //node下所有东西都可以在渲染进程中使用
            contextIsolation: false    //上下文不中断
        }
    })
    require("@electron/remote/main").enable(mainWindow.webContents); 
    mainWindow.loadFile('live2d.html')
    //关闭窗口时初始化主窗口(避免浪费内存)
    //监听到closed事件后执行
    mainWindow.on('closed', () => { mainWindow = null })
    //获取桌面大小
    let size = screen_main.getPrimaryDisplay().workAreaSize
    //获取窗口大小
    let winSize = mainWindow.getSize()
    //初始位置右下角
    mainWindow.setPosition(size.width-winSize[0], size.height-winSize[1])
}

//创建chatting窗口
function showChattingWin(textChatting) {
    chattingWin=new BrowserWindow({
        width: chatting_width, height: chatting_height,
        frame: false,                //去掉窗口边框和标题栏
        transparent: true,          //窗口透明
        resizable: true,            //是否允许改变窗口尺寸
        alwaysOnTop: true,          //窗口是否总是在最前端
        skipTaskbar: true,          //任务栏不显示图标
        webPreferences: {
            nodeIntegration: true,      //node下所有东西都可以在渲染进程中使用
            contextIsolation: false    //上下文不中断
        }
    }); 
    require("@electron/remote/main").enable(chattingWin.webContents); 
    chattingWin.loadFile('live2d/chatting.html'); 
    //关闭窗口时初始化主窗口(避免浪费内存)
    //监听到closed事件后执行
    chattingWin.on('closed', () => { chattingWin = null }); 
    //设置初始位置
    let mainX = mainWindow.getPosition()[0]; 
    let mainY = mainWindow.getPosition()[1]; 
    let startX = mainX-chatting_width-5; 
    let startY = mainY-(chatting_height-live2d_height); 
    if(startX<0) {
        startX = mainX+livd2d_width+5; 
    }
    if(startY<0) {
        startY = 0; 
    }
    chattingWin.setPosition(startX, startY); 
    
    chattingWin.webContents.on('did-finish-load',(event)=>{
        // 发送消息给渲染进程chattingWin
        chattingWin.webContents.send("openChatting", textChatting); 
    });
}

//创建setting窗口
function showSettingWin() {
    settingWin=new BrowserWindow({
        width: setting_width, height: setting_height,
        frame: true, 
        transparent: true,          //窗口透明
        resizable: true,            //是否允许改变窗口尺寸
        alwaysOnTop: true,          //窗口是否总是在最前端
        skipTaskbar: true,          //任务栏不显示图标
        webPreferences: {
            nodeIntegration: true,      //node下所有东西都可以在渲染进程中使用
            contextIsolation: false    //上下文不中断
        }
    }); 
    require("@electron/remote/main").enable(settingWin.webContents); 
    settingWin.loadFile('live2d/setting.html'); 
    //关闭窗口时初始化主窗口(避免浪费内存)
    //监听到closed事件后执行
    settingWin.on('closed', () => { chattingWin = null }); 
}

//所有窗口关闭时，退出APP
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

//启动api.py
function startPython() {
    const spawn = require('child_process').spawn
    let py = spawn('python', ['api.py'])
    py.stdout.on('data', data => console.log('data : ', data.toString()))
    py.on('close', ()=>{
    // Python ends, do stuff
    })
}

process.on('unhandledRejection', (reason, p) => {
    console.log('Promise: ', p, 'Reason: ', reason)
    // do something
})
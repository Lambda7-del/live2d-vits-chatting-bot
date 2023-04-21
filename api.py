from flask import Flask, jsonify
import time

app = Flask(__name__)

@app.route('/echo/<text>')
def echo(text):
    return jsonify(f'you input text is 啊嘎嘎 {text}')

@app.route('/chatting/<text>')
def chatting(text):
    time.sleep(5)
    return jsonify(f'a对对对')

if __name__ == '__main__':
    port = 7777
    host = '0.0.0.0'
    app.run(host,port=port)
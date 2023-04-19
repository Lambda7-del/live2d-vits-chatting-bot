from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/echo/<text>')
def echo(text):
    return jsonify(f'you input text is 啊嘎嘎 {text}')

if __name__ == '__main__':
    port = 4242
    host = '0.0.0.0'
    app.run(host,port=port)
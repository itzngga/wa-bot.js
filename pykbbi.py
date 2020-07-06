from flask import Flask, jsonify, json
from kbbi import KBBI

app = Flask(__name__)


@app.route('/')
def index():
    return 'Flask is running!'


@app.route('/kbbi/<kata>', methods=['GET'])
def get_kbbi(kata):
    try:
        judul = kata
        data = KBBI(judul)
        hasil = "Judul : " +str(kata)
        hasil += '\n\n-> Hasil : \n'+str(data.__str__(contoh=False))
        return jsonify({"hasil":hasil})
    except Exception as error:
        return jsonify({"hasil":"Kata {} tidak di temukan!".format(str(kata))})


if __name__ == '__main__':
    app.run(debug=True)
from flask import Flask, render_template

app = Flask(__name__, static_url_path="", static_folder="static")

@app.route('/')
def page_accueil():
    return render_template('accueil.html')


if __name__ == '__main__':
    app.run()

from flask import Flask, render_template, request
from flask_restful import Resource, Api
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL'].replace('postgres://', 'postgresql://')
api = Api(app)
db = SQLAlchemy(app)


class DataPoint(db.Model):
    __tablename__ = 'data'
    email = db.Column(db.String, primary_key=True)
    b1 = db.Column(db.Integer)
    b2 = db.Column(db.Integer)
    b3 = db.Column(db.Integer)
    b4 = db.Column(db.Integer)
    b5 = db.Column(db.Integer)
    b6 = db.Column(db.Integer)
    b7 = db.Column(db.Integer)
    b8 = db.Column(db.Integer)
    b9 = db.Column(db.Integer)
    lo = db.Column(db.String)
    hi = db.Column(db.String)

    def __init__(self, email, **kwargs):
        self.email = email
        self.__dict__.update(kwargs)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/thanks', methods=['GET', 'POST'])
def add_record():
    email = request.form['email']
    existing_dp = DataPoint.query.filter_by(email=email).first()
    print(existing_dp.b5)
    if existing_dp is not None:
        db.session.delete(existing_dp)
        db.session.commit()
    data = {
        'b1': int(request.form['b1']),
        'b2': int(request.form['b2']),
        'b3': int(request.form['b3']),
        'b4': int(request.form['b4']),
        'b5': int(request.form['b5']),
        'b6': int(request.form['b6']),
        'b7': int(request.form['b7']),
        'b8': int(request.form['b8']),
        'b9': int(request.form['b9']),
        'lo': request.form['lo'],
        'hi': request.form['hi'],
    }
    db.session.add(DataPoint(email, **data))
    db.session.commit()
    return render_template('thanks.html')


if __name__ == '__main__':
    app.run()

from __future__ import division, print_function
from logging import debug
# coding=utf-8
import sys
import os
import glob
import re
from tensorflow.keras.models import load_model
import argparse
from flask import Flask, redirect, url_for, request, render_template, flash, Response, jsonify
from werkzeug.utils import secure_filename
from image import image_predict
import cv2
import base64

app = Flask(__name__)

video_input = cv2.VideoCapture(0)

# Model saved with Keras model.save()
MODEL_PATH = 'mask_detector_best.model'

# load the face mask detector model from disk
print("[INFO] loading face mask detector model...")
model = load_model(MODEL_PATH)

@app.route('/', methods=['GET'])
def index():
    if request.method == 'GET':
        # show the upload form
        return render_template('index.html')

@app.route('/image', methods=['GET', 'POST'])
def home():
    if request.method == 'GET':
        # show the upload form
        return render_template('image.html')

    if request.method == 'POST':
        f = request.files['file']
        # Save the file to ./uploads
        basepath = os.path.dirname(__file__)
        file_path = os.path.join(
            basepath, 'uploads', secure_filename(f.filename))
        f.save("uploads/input.jpg")
        image = cv2.imread("uploads/input.jpg")
        output_img = image_predict(image, model)
        cv2.imwrite('uploads/output.jpg', output_img)
        encoded_string = ''
        with open("uploads/output.jpg", "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read())        
        return encoded_string

@app.route('/record_status', methods=['POST'])
def record_status():
    global video_input

    json = request.get_json()
    status = json['status']

    if status == "true":
        video_input.release()
        video_input = cv2.VideoCapture(0)
        return jsonify(result="stopped")
    else:
        # video_camera.stop_record()
        # video_input.read()
        return jsonify(result="start")

def gen(video_input):
    while True:
        success, image = video_input.read()
        image = image_predict(image, model)
        ret, jpeg = cv2.imencode('.jpg', image)
        frame = jpeg.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')   

@app.route('/video_feed')
def video_feed():
    global video_input
    return Response(gen(video_input),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/video')
def video():
    return render_template('video.html')

@app.route('/about', methods=['GET'])
def about():
    if request.method == 'GET':
        return render_template('about.html')

@app.route('/contact', methods=['GET'])
def contact():
    if request.method == 'GET':
        return render_template('contact.html')


@app.errorhandler(500)
def server_error(error):
    return render_template('error.html'), 500

if __name__ == "__main__":
    app.run(threaded=True, debug=True)
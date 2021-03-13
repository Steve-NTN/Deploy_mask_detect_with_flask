# USAGE
# python detect_mask_image.py --image images/pic1.jpeg

# import the necessary packages
from tensorflow.keras.applications.mobilenet_v2 import preprocess_input
from tensorflow.keras.preprocessing.image import img_to_array
from tensorflow.keras.models import load_model
from keras.preprocessing import image 
import numpy as np
import argparse
import cv2
import os

IMG_HEIGHT = 150
IMG_WIDTH = 150

def mask_image(img_input):
	# load our serialized face detector model from disk
	print("[INFO] loading face detector model...")
	prototxtPath = os.path.sep.join(["face_detector", "deploy.prototxt"])
	weightsPath = os.path.sep.join(["face_detector",
		"res10_300x300_ssd_iter_140000.caffemodel"])
	net = cv2.dnn.readNet(prototxtPath, weightsPath)

	# load the face mask detector model from disk
	print("[INFO] loading face mask detector model...")
	model = load_model("mask_detector.model")

	# load the input image from disk, clone it, and grab the image spatial
	# dimensions
	image_ogr = cv2.imread(img_input)
	orig = image_ogr.copy()
	(h, w) = image_ogr.shape[:2]

	# construct a blob from the image
	blob = cv2.dnn.blobFromImage(image_ogr, 1.0, (300, 300),
		(104.0, 177.0, 123.0))

	print("[INFO] computing face detections...")
	net.setInput(blob)
	detections = net.forward()

	# loop over the detections
	for i in range(0, detections.shape[2]):
		confidence = detections[0, 0, i, 2]

		if confidence > 0.5:
			# compute the (x, y)-coordinates of the bounding box for
			# the object
			box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
			(startX, startY, endX, endY) = box.astype("int")

			# ensure the bounding boxes fall within the dimensions of
			# the frame
			(startX, startY) = (max(0, startX), max(0, startY))
			(endX, endY) = (min(w - 1, endX), min(h - 1, endY))
			face = image_ogr[startY:endY, startX:endX]
			face = cv2.cvtColor(face, cv2.COLOR_BGR2RGB)
			face = cv2.resize(face, (IMG_HEIGHT, IMG_WIDTH))
			face = image.img_to_array(face)
			face = preprocess_input(face)
			face = np.expand_dims(face, axis = 0) 

			# pass the face through the model to determine if the face
			# has a mask or not
			(without_mask, with_mask) = model.predict(face)[0]
			print(with_mask, without_mask)

			label = "Mask" if without_mask > with_mask else "No Mask"
			color = (0, 255, 0) if label == "Mask" else (0, 0, 255)
			label = "{}: {:.2f}%".format(label, max(with_mask, without_mask) * 100)

			cv2.putText(image_ogr, label, (startX, startY - 10),
				cv2.FONT_HERSHEY_SIMPLEX, 0.45, color, 2)
			cv2.rectangle(image_ogr, (startX, startY), (endX, endY), color, 2)

	# show the output image
	cv2.imwrite("imgs/output.jpg", image_ogr)

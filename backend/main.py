from fastapi import FastAPI, File, UploadFile, HTTPException
import os
import tensorflow as tf
import shutil
import numpy as np
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from huggingface_hub import hf_hub_download
from fastapi.responses import FileResponse
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent
REACT_BUILD_DIR = BASE_DIR.parent/"frontend"/"build"
STATIC_DIR = REACT_BUILD_DIR/"static"

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app = FastAPI()
#prediction_model = tf.keras.models.load_model('F2model.keras')

img_height = 244
img_width = 244
labels = ['Benign', 'Malignant']


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development only
    allow_methods=["*"],
    allow_headers=["*"],
)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.on_event("startup")
async def load_model():
    global prediction_model
    model_path = hf_hub_download(
        repo_id="Faheem29/Skin_cancer",
        filename="F2model.keras"
    )
    prediction_model = tf.keras.models.load_model(model_path,compile=False)
    
    
@app.get('/')
async def serve_react_app():
    index_file = REACT_BUILD_DIR/"index.html"
    
    return FileResponse(index_file)



@app.post('/')
def upload_image(file: UploadFile = File(...)):

    file_location = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_location, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file.file.close()

    img_path = os.path.join(UPLOAD_DIR, file.filename)
    img = tf.keras.utils.load_img(img_path, target_size=(img_height,img_width),color_mode="rgb")
    img_array = tf.keras.utils.img_to_array(img)

    img_batch = np.expand_dims(img_array, axis=0)
    
    predictions = prediction_model.predict(img_batch)
    predicted_classes = tf.argmax(predictions, axis=1)
    predicted_class_name = [labels[i] for i in predicted_classes]
    

    probabilities = tf.nn.softmax(predictions[0]).numpy()  # for Dense(2) models
    predicted_class_index = np.argmax(probabilities)
    confidence = float(probabilities[predicted_class_index])

    os.remove(img_path)
    return {
        "class": predicted_class_name,
        "confidence": confidence
    }


    
    

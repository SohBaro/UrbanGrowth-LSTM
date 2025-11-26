import os
import base64
import numpy as np
import cv2
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from skimage.morphology import binary_closing, disk, remove_small_objects, skeletonize
from skimage.filters import gaussian, threshold_otsu

# ==========================================
# THIS IS THE CRITICAL LINE UVICORN NEEDS:
# ==========================================
app = FastAPI()

# Allow your Frontend to talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# 1. MODEL ARCHITECTURE
# ==========================================
def build_convlstm_unet(input_shape=(1, 128, 128, 3)):
    inp = tf.keras.layers.Input(input_shape)
    
    @tf.keras.utils.register_keras_serializable()
    def add_coordinate_channels(x):
        batch_size = tf.shape(x)[0]
        time_steps = tf.shape(x)[1]
        h, w = x.shape[2], x.shape[3]
        x_coords = tf.linspace(-1.0, 1.0, w)
        y_coords = tf.linspace(-1.0, 1.0, h)
        xx, yy = tf.meshgrid(x_coords, y_coords)
        xx = tf.tile(xx[None, None, :, :, None], [batch_size, time_steps, 1, 1, 1])
        yy = tf.tile(yy[None, None, :, :, None], [batch_size, time_steps, 1, 1, 1])
        return tf.concat([x, xx, yy], axis=-1)
    
    coord_inp = tf.keras.layers.Lambda(add_coordinate_channels)(inp)
    
    # Encoder
    c1 = tf.keras.layers.TimeDistributed(tf.keras.layers.Conv2D(32, 3, activation='relu', padding='same'))(coord_inp)
    c1 = tf.keras.layers.TimeDistributed(tf.keras.layers.BatchNormalization())(c1)
    p1 = tf.keras.layers.TimeDistributed(tf.keras.layers.MaxPooling2D(2))(c1)
    
    c2 = tf.keras.layers.TimeDistributed(tf.keras.layers.Conv2D(64, 3, activation='relu', padding='same'))(p1)
    c2 = tf.keras.layers.TimeDistributed(tf.keras.layers.BatchNormalization())(c2)
    p2 = tf.keras.layers.TimeDistributed(tf.keras.layers.MaxPooling2D(2))(c2)
    
    c3 = tf.keras.layers.TimeDistributed(tf.keras.layers.Conv2D(128, 3, activation='relu', padding='same'))(p2)
    c3 = tf.keras.layers.TimeDistributed(tf.keras.layers.BatchNormalization())(c3)
    p3 = tf.keras.layers.TimeDistributed(tf.keras.layers.MaxPooling2D(2))(c3)
    
    b = tf.keras.layers.ConvLSTM2D(256, 3, padding='same', return_sequences=False)(p3)
    
    # Decoder
    u3 = tf.keras.layers.UpSampling2D()(b)
    c3_skip = tf.keras.layers.Lambda(lambda x: x[:, 0])(c3)
    u3 = tf.keras.layers.concatenate([u3, c3_skip])
    d3 = tf.keras.layers.Conv2D(128, 3, activation='relu', padding='same')(u3)
    d3 = tf.keras.layers.BatchNormalization()(d3)
    
    u2 = tf.keras.layers.UpSampling2D()(d3)
    c2_skip = tf.keras.layers.Lambda(lambda x: x[:, 0])(c2)
    u2 = tf.keras.layers.concatenate([u2, c2_skip])
    d2 = tf.keras.layers.Conv2D(64, 3, activation='relu', padding='same')(u2)
    d2 = tf.keras.layers.BatchNormalization()(d2)
    
    u1 = tf.keras.layers.UpSampling2D()(d2)
    c1_skip = tf.keras.layers.Lambda(lambda x: x[:, 0])(c1)
    u1 = tf.keras.layers.concatenate([u1, c1_skip])
    d1 = tf.keras.layers.Conv2D(32, 3, activation='relu', padding='same')(u1)
    d1 = tf.keras.layers.BatchNormalization()(d1)
    
    out = tf.keras.layers.Conv2D(1, 1, activation='sigmoid')(d1)
    return tf.keras.models.Model(inp, out)

# ==========================================
# 2. LOAD MODEL ON STARTUP
# ==========================================
print("⏳ Loading Model...")
model = build_convlstm_unet()

# Check for model file
if os.path.exists("best_convlstm_unet.h5"):
    model.load_weights("best_convlstm_unet.h5")
    print("✅ Model loaded successfully!")
else:
    print("⚠️ FATAL: best_convlstm_unet.h5 NOT FOUND in current folder.")

# ==========================================
# 3. HELPER FUNCTIONS
# ==========================================
def get_refined_skeleton(binary_mask, original_shape):
    closed_mask = binary_closing(binary_mask, disk(3))
    skeleton = skeletonize(closed_mask)
    skeleton_float = skeleton.astype(np.float32)
    
    if original_shape and original_shape[:2] != skeleton_float.shape:
        h, w = original_shape[:2]
        final_mask = cv2.resize(skeleton_float, (w, h), interpolation=cv2.INTER_NEAREST)
    else:
        final_mask = skeleton_float
    return final_mask > 0.5

def encode_image(image_arr):
    if image_arr.shape[-1] == 3:
        image_arr = cv2.cvtColor(image_arr, cv2.COLOR_RGB2BGR)
    _, buffer = cv2.imencode('.png', image_arr)
    return base64.b64encode(buffer).decode('utf-8')

# ==========================================
# 4. API ENDPOINT (Updated with Metrics)
# ==========================================
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # 1. Read Image
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if image is None:
        raise HTTPException(status_code=400, detail="Invalid image")

    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    original_shape = image_rgb.shape

    # 2. Preprocess
    img_resized = cv2.resize(image_rgb, (128, 128))
    img_norm = img_resized.astype(np.float32) / 255.0
    img_input = img_norm[np.newaxis, np.newaxis, ...]

    # 3. Predict
    pred = model.predict(img_input, verbose=0)[0, :, :, 0]

    # 4. Post-process (Skeletonization)
    smooth = gaussian(pred, sigma=0.7)
    th = max(0.12, threshold_otsu(smooth) * 0.9)
    binary_raw = smooth > th
    binary_raw = remove_small_objects(binary_raw, min_size=10)
    
    skeleton_mask = get_refined_skeleton(binary_raw, original_shape)

    # ==========================================
    # 5. CALCULATE METRICS (NEW!)
    # ==========================================
    # Count how many pixels are "True" (Road)
    road_pixel_count = int(np.sum(skeleton_mask))
    
    # Calculate total pixels in the image
    total_pixels = original_shape[0] * original_shape[1]
    
    # Calculate percentage
    coverage_pct = float((road_pixel_count / total_pixels) * 100)

    # ==========================================
    # 6. PREPARE IMAGES
    # ==========================================
    mask_uint8 = (skeleton_mask * 255).astype(np.uint8)
    display_mask = cv2.dilate(mask_uint8, np.ones((3,3), np.uint8))
    
    overlay = image_rgb.copy()
    overlay[display_mask > 0] = [0, 255, 0] 
    final_overlay = cv2.addWeighted(overlay, 0.6, image_rgb, 0.4, 0)

    return {
        "original_image": encode_image(image_rgb),
        "mask_image": encode_image(mask_uint8),
        "overlay_image": encode_image(final_overlay),
        # SEND THE MATH RESULTS BACK
        "metrics": {
            "road_pixels": road_pixel_count,
            "coverage_percentage": round(coverage_pct, 2)
        }
    }
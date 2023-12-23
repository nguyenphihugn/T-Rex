from PIL import Image
import PIL
from tensorflow import keras
from keras.models import load_model
from keras.applications.efficientnet import preprocess_input, decode_predictions
import numpy as np
from flask import Flask, render_template, request, redirect
import os
import h5py
from PIL import Image

app = Flask(__name__)
app.static_folder = 'static'
# Thư mục lưu trữ model
MODEL_FOLDER = 'models'
UPLOAD_FOLDER = 'static/upload'
ALLOWED_EXTENSIONS = {'h5'}

mapping_path = 'templates/LOC_synset_mapping.txt'

label_mapping = {}
i = 0
for line in open(mapping_path):
    if 0 <= i < 1000:
        label = line[9:].strip()
        label_mapping[i] = label
    i += 1

app.config['MODEL_FOLDER'] = MODEL_FOLDER
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def load_model_with_encoding(model_path):
    with h5py.File(model_path, 'r', libver='latest', swmr=True) as f:
        model = load_model(f, compile=False)
    return model

# Load model khi ứng dụng khởi động
# model_folder = app.config['MODEL_FOLDER']
# model_file = [f for f in os.listdir(model_folder) if f.endswith('.h5')]
# model_filename = model_file[0]
# model_path = os.path.join(model_folder, model_filename)
# model = load_model_with_encoding(model_path)

# def run_model_safely(image_path):
#     try:
#     # Thực hiện kiểm tra và xử lý lỗi trước khi gọi hàm run_model
#         img = Image.open(image_path).convert("RGB")
#     except PIL.UnidentifiedImageError:
#         return render_template('index.html', result="Tệp không hợp lệ. Vui lòng tải lên một tệp ảnh hợp lệ.")
#     # Nếu không có lỗi, gọi hàm run_model bình thường
#     result = run_model(image_path)
#     return result

# def run_model(image_path):
#     img = Image.open(image_path).convert("RGB")
#     img = img.resize((300, 300))  # Thay đổi kích thước ảnh nếu cần
#     img_array = np.array(img)
#     img_array = np.expand_dims(img_array, axis=0)
#     img_array = preprocess_input(img_array)
#     prediction = model.predict(img_array)
#     # Lấy chỉ số của lớp có xác suất cao nhất
#     class_index = np.argmax(prediction)
#     predicted_label = label_mapping.get(class_index, "Không xác định")
#     print("Dự đoán là {}.".format(predicted_label))
#     #Top 5
#     # top5 = np.argsort(prediction)[::-1][:5]
#     # print(top5)
#     # In ra thông tin về label mapping
#     # for key, value in label_mapping.items():
#     #     print(f"{key}: {value}")
#     # In ra giá trị của vectơ dự đoán 
#     # print("Vector dự đoán:", prediction)
#     #  Xác suất của từng lớp
#     for i, value in enumerate(prediction[0]):
#         print(f"Xác suất của lớp {i+1}: {value}")
#     return predicted_label

@app.route('/upload', methods=['POST'])
def upload():
    uploaded_file = request.files['file']
    if uploaded_file and uploaded_file.filename != '':
        # Lưu file tạm thời
        upload_folder = app.config['UPLOAD_FOLDER']
        # Xóa ảnh cũ nếu có
        old_image_path = os.path.join(upload_folder, 'temp_image.jpg')
        if os.path.exists(old_image_path):
            os.remove(old_image_path)
        # Lưu file tạm thời với tên là temp_image.jpg
        image_path = os.path.join(upload_folder, 'temp_image.jpg')
        uploaded_file.save(image_path)
        return redirect('/upload')
    else:
        return render_template('index.html', message="Vui lòng chọn ảnh")

@app.route('/upload')
def upload_camera():
    return render_template('index.html', message="Upload thành công")

@app.route('/')
def index():
    return render_template('index.html')

# @app.route('/predict', methods=['POST'])
# def predict():
#     image_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp_image.jpg')
#     if os.path.exists(image_path):
#         result = run_model_safely(image_path)
#         google_link = f'https://www.google.com/search?q={result}'
#         return render_template('index.html', result=result, google_link=google_link)
#     else:
#         return render_template('index.html', result="Lỗi khi lưu ảnh tạm thời")


if __name__ == '__main__':
    app.run(debug=True)
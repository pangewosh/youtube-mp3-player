import os
from flask import Flask, render_template, request, jsonify, send_from_directory
from yt_dlp import YoutubeDL
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
CORS(app)
app.config['UPLOAD_FOLDER'] = 'downloads'
app.config['MAX_CONTENT_LENGTH'] = 1000 * 1024 * 1024  # 1000MB max file size

# Ensure the downloads directory exists
try:
    os.makedirs(os.path.join(os.getcwd(), app.config['UPLOAD_FOLDER']), exist_ok=True)
except Exception as e:
    print(f"Error creating downloads directory: {e}")
    # Try alternative location if default fails
    app.config['UPLOAD_FOLDER'] = os.path.join(os.getcwd(), 'downloads')
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def download_audio(url):
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(app.config['UPLOAD_FOLDER'], '%(title)s.%(ext)s'),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'quiet': False,  # Daha fazla hata detayı için
        'noplaylist': True,
        'extract_flat': False,
        'ignoreerrors': False,
        'no_warnings': False,
        'extractor_retries': 3,
        'fragment_retries': 3,
        'retries': 3,
        'force_generic_extractor': True,
        'cookiefile': 'cookies.txt',
        'ffmpeg_location': os.path.join(os.getcwd(), 'ffmpeg.exe') if os.name == 'nt' else 'ffmpeg',
    }
    
    try:
        with YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info).replace('.webm', '.mp3').replace('.m4a', '.mp3')
            return {
                'status': 'success',
                'filename': os.path.basename(filename),
                'title': info.get('title', 'Unknown Title'),
                'duration': info.get('duration', 0)
            }
    except Exception as e:
        return {'status': 'error', 'message': str(e)}

@app.route('/')
def index():
    # Get list of downloaded MP3 files
    files = []
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        if file.endswith('.mp3'):
            files.append({
                'name': file,
                'path': f"{app.config['UPLOAD_FOLDER']}/{file}"
            })
    return render_template('index.html', files=files)

@app.route('/download', methods=['POST'])
def download():
    data = request.get_json()
    url = data.get('url')
    if not url:
        return jsonify({'status': 'error', 'message': 'No URL provided'}), 400
    
    result = download_audio(url)
    return jsonify(result)

@app.route('/downloads/<path:filename>')
def download_file(filename):
    return send_from_directory(
        app.config['UPLOAD_FOLDER'],
        filename,
        as_attachment=False
    )

@app.route('/list')
def list_files():
    files = []
    for file in os.listdir(app.config['UPLOAD_FOLDER']):
        if file.endswith('.mp3'):
            files.append({
                'name': file,
                'path': f"/downloads/{file}"
            })
    return jsonify(files)

@app.route('/delete/<filename>', methods=['DELETE'])
def delete_file(filename):
    try:
        # Secure the filename to prevent directory traversal
        filename = secure_filename(filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Check if file exists and is an MP3 file
        if not os.path.exists(file_path) or not filename.lower().endswith('.mp3'):
            return jsonify({'status': 'error', 'message': 'Dosya bulunamadı veya geçersiz dosya türü'}), 404
            
        # Delete the file
        os.remove(file_path)
        return jsonify({'status': 'success', 'message': 'Dosya başarıyla silindi'})
        
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')

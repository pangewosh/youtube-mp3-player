# YouTube MP3 Çalar

Bu uygulama, YouTube'dan MP3 indirmenizi ve çalmanızı sağlayan basit bir web uygulamasıdır. İndirilen müzikleri çevrimdışı olarak dinleyebilirsiniz.

## Özellikler

- YouTube URL'sinden MP3 indirme
- Çevrimdışı müzik çalma
- Çalma listesi oluşturma
- Müzikleri silme
- Responsive tasarım (mobil uyumlu)

## Kurulum

1. Gerekli yazılımları yükleyin:
   - [Python 3.8 veya üzeri](https://www.python.org/downloads/)
   - [FFmpeg](https://ffmpeg.org/download.html) (Windows için: [Windows Builds](https://www.gyan.dev/ffmpeg/builds/))

2. Projeyi klonlayın veya indirin.

3. Gerekli Python paketlerini yükleyin:
   ```bash
   pip install -r requirements.txt
   ```

4. FFmpeg'i PATH'e ekleyin veya doğrudan indirip `ffmpeg.exe` dosyasını proje dizinine kopyalayın.

## Kullanım

1. Uygulamayı başlatın:
   ```bash
   python app.py
   ```

2. Tarayıcınızda şu adresi açın:
   ```
   http://localhost:5000
   ```

3. YouTube'dan bir video URL'si yapıştırın ve "İndir" butonuna tıklayın.

4. İndirilen müzikler "Müzik Kütüphanem" bölümünde görünecektir.

## Çevrimdışı Kullanım

1. Uygulamayı bir kez çalıştırıp müzikleri indirdikten sonra, internet bağlantınızı kesebilirsiniz.

2. Uygulamayı tekrar başlattığınızda, daha önce indirdiğiniz müzikler çalınmaya devam edecektir.

## Notlar

- İndirilen müzikler `downloads` klasörüne kaydedilir.
- Uygulamayı kapatıp tekrar açtığınızda, indirilen müzikler korunur.
- Yalnızca kişisel kullanım için tasarlanmıştır. Lütfen telif hakkı yasalarına dikkat edin.

## Gereksinimler

- Python 3.8+
- FFmpeg
- İnternet bağlantısı (sadece indirme işlemi için)

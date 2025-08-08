// DOM Elements
const audioPlayer = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const currentTrackEl = document.getElementById('currentTrack');
const playlistEl = document.getElementById('playlist');
const youtubeUrlInput = document.getElementById('youtubeUrl');
const downloadStatus = document.getElementById('downloadStatus');

// Player state
let currentTrackIndex = 0;
let tracks = [];
let isPlaying = false;

// Format time in seconds to MM:SS
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Update progress bar and time
function updateProgress() {
    const { currentTime, duration } = audioPlayer;
    const progressPercent = (currentTime / duration) * 100;
    progressBar.style.width = `${progressPercent}%`;
    currentTimeEl.textContent = formatTime(currentTime);
    durationEl.textContent = formatTime(duration);
}

// Update player controls
function updateControls() {
    playPauseBtn.innerHTML = isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>';
}

// Play a track by index
function playTrack(index) {
    if (tracks.length === 0) return;
    
    currentTrackIndex = index;
    const track = tracks[currentTrackIndex];
    audioPlayer.src = track.path;
    currentTrackEl.textContent = track.name.replace('.mp3', '');
    
    audioPlayer.play()
        .then(() => {
            isPlaying = true;
            updateControls();
        })
        .catch(error => console.error('Error playing track:', error));
}

// Toggle play/pause
function togglePlay() {
    if (tracks.length === 0) return;
    
    if (audioPlayer.paused) {
        if (!audioPlayer.src) {
            playTrack(0);
        } else {
            audioPlayer.play()
                .then(() => {
                    isPlaying = true;
                    updateControls();
                });
        }
    } else {
        audioPlayer.pause();
        isPlaying = false;
        updateControls();
    }
}

// Play next track
function playNext() {
    if (tracks.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % tracks.length;
    playTrack(nextIndex);
}

// Play previous track
function playPrevious() {
    if (tracks.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    playTrack(prevIndex);
}

// Update playlist UI
function updatePlaylist() {
    if (tracks.length === 0) {
        playlistEl.innerHTML = '<p class="text-gray-500 text-center py-4">Henüz müzik yok. Yukarıdan indirmeye başlayın!</p>';
        return;
    }

    playlistEl.innerHTML = tracks.map((track, index) => `
        <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer ${index === currentTrackIndex ? 'bg-blue-50' : ''}" 
             onclick="playTrack(${index})">
            <div class="flex items-center">
                <i class="fas fa-music text-gray-400 mr-3"></i>
                <span>${track.name.replace('.mp3', '')}</span>
            </div>
            <button onclick="event.stopPropagation(); deleteTrack('${track.name}')" 
                    class="text-red-500 hover:text-red-700">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Delete a track
async function deleteTrack(filename) {
    if (!confirm('Bu şarkıyı silmek istediğinizden emin misiniz?')) return;
    
    try {
        const response = await fetch(`/delete/${encodeURIComponent(filename)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Remove from tracks array
            tracks = tracks.filter(track => track.name !== filename);
            updatePlaylist();
            
            // If the deleted track was playing, stop it
            if (tracks.length === 0) {
                audioPlayer.pause();
                audioPlayer.src = '';
                currentTrackEl.textContent = '-';
                progressBar.style.width = '0%';
                currentTimeEl.textContent = '0:00';
            } else if (currentTrackIndex >= tracks.length) {
                // If we deleted the last track, play the new last track
                currentTrackIndex = Math.max(0, tracks.length - 1);
                playTrack(currentTrackIndex);
            }
        }
    } catch (error) {
        console.error('Error deleting track:', error);
        alert('Şarkı silinirken bir hata oluştu.');
    }
}

// Download audio from YouTube
async function downloadAudio() {
    const url = youtubeUrlInput.value.trim();
    if (!url) {
        downloadStatus.textContent = 'Lütfen bir YouTube URL\'si girin.';
        downloadStatus.className = 'text-red-500';
        return;
    }

    downloadStatus.textContent = 'İndiriliyor, lütfen bekleyin...';
    downloadStatus.className = 'text-blue-500';
    
    try {
        const response = await fetch('/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const result = await response.json();
        
        if (result.status === 'success') {
            downloadStatus.textContent = `İndirme başarılı: ${result.title}`;
            downloadStatus.className = 'text-green-500';
            youtubeUrlInput.value = '';
            
            // Add to tracks and play
            const newTrack = {
                name: result.filename,
                path: `/downloads/${result.filename}`
            };
            
            // Check if track already exists
            const exists = tracks.some(track => track.name === newTrack.name);
            if (!exists) {
                tracks.push(newTrack);
                updatePlaylist();
                
                // If this is the first track, play it
                if (tracks.length === 1) {
                    playTrack(0);
                }
            }
        } else {
            throw new Error(result.message || 'Bilinmeyen bir hata oluştu.');
        }
    } catch (error) {
        console.error('Download error:', error);
        downloadStatus.textContent = `Hata: ${error.message}`;
        downloadStatus.className = 'text-red-500';
    }
}

// Load tracks from server
async function loadTracks() {
    try {
        const response = await fetch('/list');
        const files = await response.json();
        tracks = files.map(file => ({
            name: file.name,
            path: file.path
        }));
        updatePlaylist();
    } catch (error) {
        console.error('Error loading tracks:', error);
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadTracks();
    
    // Allow pasting YouTube URL with right-click
    youtubeUrlInput.addEventListener('paste', (e) => {
        setTimeout(() => {
            const pastedText = youtubeUrlInput.value;
            if (pastedText.includes('youtube.com') || pastedText.includes('youtu.be')) {
                downloadAudio();
            }
        }, 100);
    });
    
    // Allow pressing Enter to download
    youtubeUrlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            downloadAudio();
        }
    });
});

audioPlayer.addEventListener('timeupdate', updateProgress);
audioPlayer.addEventListener('ended', playNext);
audioPlayer.addEventListener('play', () => {
    isPlaying = true;
    updateControls();
});
audioPlayer.addEventListener('pause', () => {
    isPlaying = false;
    updateControls();
});

// Make functions available globally
window.playTrack = playTrack;
window.togglePlay = togglePlay;
window.playNext = playNext;
window.playPrevious = playPrevious;
window.downloadAudio = downloadAudio;
window.deleteTrack = deleteTrack;

import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';

let stream = null;
let currentImageData = null;

// DOM要素の取得
const video = document.getElementById('video');
const photo = document.getElementById('photo');
const canvas = document.getElementById('canvas');
const placeholder = document.getElementById('placeholder');
const status = document.getElementById('status');

const startCameraBtn = document.getElementById('startCamera');
const captureBtn = document.getElementById('capturePhoto');
const loadBtn = document.getElementById('loadImage');
const saveBtn = document.getElementById('saveImage');
const stopCameraBtn = document.getElementById('stopCamera');
const resizeBtn = document.getElementById('resizeImage');

// ステータス表示
function showStatus(message, type = 'success') {
    status.textContent = message;
    status.className = `status ${type}`;
    status.style.display = 'block';
    setTimeout(() => {
        status.style.display = 'none';
    }, 3000);
}

// プレースホルダーの表示/非表示
function togglePlaceholder(show) {
    placeholder.style.display = show ? 'block' : 'none';
}

// メディア要素の表示管理
function showMedia(element) {
    video.style.display = 'none';
    photo.style.display = 'none';
    togglePlaceholder(false);
    
    if (element) {
        element.style.display = 'block';
    } else {
        togglePlaceholder(true);
    }
}

// カメラ開始
startCameraBtn.addEventListener('click', async () => {
    try {
        // メディアデバイスサポートをチェック
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('お使いのブラウザはカメラアクセスをサポートしていません');
        }

        showStatus('カメラアクセスを要求中...', 'success');
        
        // より基本的な設定でカメラアクセスを試行
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: true,
            audio: false
        });
        
        video.srcObject = stream;
        showMedia(video);
        
        startCameraBtn.style.display = 'none';
        stopCameraBtn.style.display = 'inline-block';
        
        showStatus('カメラが開始されました', 'success');
    } catch (err) {
        let errorMessage = 'カメラアクセスエラー: ';
        
        switch (err.name) {
            case 'NotAllowedError':
                errorMessage += '📹 カメラへのアクセスが拒否されました。ブラウザの設定でカメラ許可を与えてください。';
                break;
            case 'NotFoundError':
                errorMessage += '📷 カメラが見つかりません。カメラが接続されているか確認してください。';
                break;
            case 'NotReadableError':
                errorMessage += '🔧 カメラが他のアプリケーションで使用されている可能性があります。';
                break;
            case 'OverconstrainedError':
                errorMessage += '⚙️ カメラの設定に問題があります。';
                break;
            case 'SecurityError':
                errorMessage += '🔒 セキュリティ制限によりカメラにアクセスできません。';
                break;
            default:
                errorMessage += `${err.message} (${err.name})`;
        }
        
        showStatus(errorMessage, 'error');
        console.error('Camera error details:', {
            name: err.name,
            message: err.message,
            stack: err.stack
        });
    }
});

// カメラ停止
stopCameraBtn.addEventListener('click', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    
    showMedia(null);
    startCameraBtn.style.display = 'inline-block';
    stopCameraBtn.style.display = 'none';
    
    showStatus('カメラが停止されました', 'success');
});

// 写真撮影
captureBtn.addEventListener('click', () => {
    if (!stream) {
        showStatus('カメラが開始されていません', 'error');
        return;
    }
    
    try {
        const context = canvas.getContext('2d');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        currentImageData = canvas.toDataURL('image/png');
        photo.src = currentImageData;
        showMedia(photo);
        
        // カメラを停止
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            stream = null;
            startCameraBtn.style.display = 'inline-block';
            stopCameraBtn.style.display = 'none';
        }
        
        showStatus('写真を撮影しました', 'success');
    } catch (err) {
        showStatus(`撮影エラー: ${err.message}`, 'error');
        console.error('Capture error:', err);
    }
});

// 画像読み込み
loadBtn.addEventListener('click', async () => {
    try {
        const selected = await open({
            multiple: false,
            filters: [{
                name: 'Image',
                extensions: ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp']
            }]
        });
        
        if (selected) {
            const dataUrl = await invoke('load_image', { path: selected });
            currentImageData = dataUrl;
            photo.src = dataUrl;
            showMedia(photo);
            showStatus('画像を読み込みました', 'success');
        }
    } catch (err) {
        showStatus(`画像読み込みエラー: ${err}`, 'error');
        console.error('Load error:', err);
    }
});

// 画像保存
saveBtn.addEventListener('click', async () => {
    if (!currentImageData) {
        showStatus('保存する画像がありません', 'error');
        return;
    }
    
    try {
        const path = await save({
            filters: [{
                name: 'PNG Image',
                extensions: ['png']
            }],
            defaultPath: 'camera_capture.png'
        });
        
        if (path) {
            await invoke('save_image', { 
                data: currentImageData,
                path: path 
            });
            showStatus('画像を保存しました', 'success');
        }
    } catch (err) {
        showStatus(`保存エラー: ${err}`, 'error');
        console.error('Save error:', err);
    }
});

// 画像リサイズ
resizeBtn.addEventListener('click', async () => {
    if (!currentImageData) {
        showStatus('リサイズする画像がありません', 'error');
        return;
    }
    
    const width = parseInt(document.getElementById('resizeWidth').value);
    const height = parseInt(document.getElementById('resizeHeight').value);
    
    if (!width || !height || width <= 0 || height <= 0) {
        showStatus('有効な幅と高さを入力してください', 'error');
        return;
    }
    
    try {
        const resizedData = await invoke('resize_image', {
            data: currentImageData,
            width: width,
            height: height
        });
        
        currentImageData = resizedData;
        photo.src = resizedData;
        showMedia(photo);
        showStatus(`画像を ${width}x${height} にリサイズしました`, 'success');
    } catch (err) {
        showStatus(`リサイズエラー: ${err}`, 'error');
        console.error('Resize error:', err);
    }
});

// ページ読み込み時の初期化
document.addEventListener('DOMContentLoaded', () => {
    showMedia(null);
    showStatus('アプリケーションが準備できました', 'success');
});

// ページを離れる時にカメラを停止
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});
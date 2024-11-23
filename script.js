let mediaRecorder;
let audioChunks = [];

const startBtn = document.getElementById('start-recording');
const stopBtn = document.getElementById('stop-recording');
const sendBtn = document.getElementById('send-audio');
const audioPreview = document.getElementById('audio-preview');
const statusText = document.getElementById('status');
const resultText = document.getElementById('result');

startBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Ваш браузер не поддерживает запись аудио.');
        return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    audioChunks = [];
    mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
    };

    mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        audioPreview.src = audioUrl;
        sendBtn.disabled = false; // Enable the send button
    };

    mediaRecorder.start();
    statusText.textContent = 'Recording...';
    startBtn.disabled = true;
    stopBtn.disabled = false;
});

stopBtn.addEventListener('click', () => {
    mediaRecorder.stop();
    statusText.textContent = 'Запись остановлена. Пожалуйста, проверьте вашу запись ниже.';
    startBtn.disabled = false;
    stopBtn.disabled = true;
});

sendBtn.addEventListener('click', async () => {
    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.wav');

    statusText.textContent = 'Отправка записи на сервер...';

    try {
        const response = await fetch('http://127.0.0.1:33333/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            resultText.textContent = data.text || 'Речь не распознана.';
        } else {
            resultText.textContent = 'Возникла ошибка при распозанвании речи.';
        }
    } catch (error) {
        resultText.textContent = 'Ошибка подключения к серверу.';
    }
});

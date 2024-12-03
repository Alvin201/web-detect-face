function resizeCanvasAndResults(dimensions, canvas, results) {
    const { width, height } = dimensions instanceof HTMLVideoElement
        ? faceapi.getMediaDimensions(dimensions)
        : dimensions;
    canvas.width = width;
    canvas.height = height;

    return results.map(res => res.forSize(width, height));
}

function drawDetections(dimensions, canvas, detections) {
    const resizedDetections = resizeCanvasAndResults(dimensions, canvas, detections);
    faceapi.drawDetection(canvas, resizedDetections);
}

function drawLandmarks(dimensions, canvas, results, withBoxes = true) {
    const resizedResults = resizeCanvasAndResults(dimensions, canvas, results);
    const captureButton = document.getElementById('captureBtn');
    if (withBoxes) {
        resizedResults.forEach(det => {
            const score = det.detection.score;
            const boxColor = score < 0.6 ? 'red' : 'green'; // Red if score < 0.8, otherwise green

            if (score < 0.69) {
                captureButton.disabled = true;
                captureButton.style.backgroundColor = "red";
            } else {
                captureButton.disabled = false;
                captureButton.style.backgroundColor = "";
            }

            // Draw the detection with the appropriate color
            faceapi.drawDetection(canvas, [det.detection], { boxColor });
        });
    }

    // Draw the landmarks
    const faceLandmarks = resizedResults.map(det => det.landmarks);
    const drawLandmarksOptions = {
        lineWidth: 2,
        drawLines: true, // Set to true to draw lines connecting the landmarks
        color: 'green'
    };

    faceapi.drawLandmarks(canvas, faceLandmarks, drawLandmarksOptions);
}

// Run face detection every frame using requestAnimationFrame for better performance
async function onPlay() {
    const videoEl = document.getElementById('inputVideo');
    const overlay = document.getElementById('overlay');
    const options = new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 });

    // Detect face
    const result = await faceapi.detectSingleFace(videoEl, options).withFaceLandmarks(true);

    if (result) {
        drawLandmarks(videoEl, overlay, [result], true);
    }

    requestAnimationFrame(onPlay);
}


async function run() {
    const video = document.getElementById('inputVideo');
    const status = document.getElementById('status');

    try {
        // Load models
        await faceapi.loadTinyFaceDetectorModel('/models');
        await faceapi.loadFaceLandmarkTinyModel('/models');

        // Access the webcam
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 450, height: 300 } });
        video.srcObject = stream;

        video.onplay = () => onPlay();

        status.textContent = 'Webcam is active';
        status.style.color = 'green';
    } catch (err) {
        console.error("Error accessing camera: ", err);
        status.textContent = 'Error accessing camera.';
        status.style.color = 'red';
    }
}

run();
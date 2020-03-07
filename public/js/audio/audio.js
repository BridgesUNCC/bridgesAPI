var glMain;
var programMain;
var canvasMain;

var glOverview;
var programOverview;
var canvasOverview;

var audioContext;  
var audioBuffer;
var wavBytes;
var peaks;

var reader = new FileReader();
var canvasMain;
var canvasCtx;

var dataMin, dataMax;

var baseLine = [-1, 0, 1, 0];

var SampleType = {
    NONE: 0,
    FULL: 1,
    PEAKS: 2,
}

var waveData = {};
var waveAttribsMain = {};
var waveAttribsOverview = {};
var waveMode = SampleType.PEAKS;

var waveLine = [-1, -1, -1, 1];
var range = [0, 1];

var audioElem;

var drag = false;
var dragI = 0;
var dragWidth = 0;
var dragOffsetX = 0;

var useOverview = true;
var sampleButton, sampleSize;

d3.audio_webgl = function(canvas, W, H, data){

    // fragment shader
    const fsSource = `
    precision mediump float;
    
    uniform vec4 color;
    
    void main()
    { 
        gl_FragColor = color;
    }
    `;

    // vertex shader
    const vsSource = `
    attribute vec4 vPosition;
        
    uniform int sampleMode;
    
    uniform vec2 dataSize;

    attribute vec2 sample;
    attribute vec2 peaks;
    
    void main()
    {
        gl_PointSize = 1.0;

        if (sampleMode == 1) {
            float x = 1.0 - (2.0 * (1.0 - (sample.x - dataSize.x) / (dataSize.y - dataSize.x)));
            gl_Position = vec4(x, sample.y, 1.0, 1.0);
        }
        else if (sampleMode == 2) {
            float x = 1.0 - (2.0 * (1.0 - (peaks.x - dataSize.x) / (dataSize.y - dataSize.x)));
            gl_Position = vec4(x, peaks.y, 1.0, 1.0);
        }
        else {
            gl_Position = vPosition;
        }
    }
    `;

    // Set up the audio context
    if (!window.AudioContext) {
        if (!window.webkitAudioContext) {
            alert("Web Audio API not supported in this browser.");
            return;
        }
        window.AudioContext = window.webkitAudioContext;
    }

    // File input
    onInputChange(data);

    canvasMain = document.getElementById("canvas_webgl0");
    // gets the main canvas for the main wave
    glMain = WebGLUtils.setupWebGL(canvas.node());
    
    canvasOverview = document.getElementById("canvas_webgl_overview");
    // gets the canvas element for the wave overview
    glOverview = WebGLUtils.setupWebGL(document.getElementById("canvas_webgl_overview"));
    glOverview.viewport(0, 0, glOverview.canvas.width, glOverview.canvas.height);
    glOverview.clearColor(171/255, 183/255, 183/255, 1.0);
    programOverview = initShaderProgram(glOverview, vsSource, fsSource);
    glOverview.useProgram(programOverview);
    
    if (!glMain) { alert("WebGL isn't available"); }

    glMain.canvas.width = W;
    glMain.canvas.height = H;

    // Configure WebGL
    glMain.viewport(0, 0, glMain.canvas.width, glMain.canvas.height);
    glMain.clearColor(171/255, 183/255, 183/255, 1.0);

    // Load shaders and initialize attribute buffers
    programMain = initShaderProgram(glMain, vsSource, fsSource);
    glMain.useProgram(programMain);


    audioElem = document.getElementById("audio");
    sampleButton = document.getElementById("sample-button");
    sampleSize = document.getElementById("sample-size");

    sampleButton.onclick = function(event) {
        // Make sure the value is a number
        if (!isNaN(sampleSize.value) && audioBuffer) {        
            var samples = audioBuffer.getChannelData(0);
            if (samples.length > 0) {
                range[1] = Math.min(1, range[0] + (Math.floor(sampleSize.value) / samples.length));
            }

            alignData();
        }
    }

    // Prevent context (Right click) menus on canvas
    canvasMain.oncontextmenu = function(event) { return false; }
    canvasOverview.oncontextmenu = function(event) { return false; }

    canvasMain.onmousedown = function(event) {
        seekEvent(event);
    }

    canvasMain.onmousemove = function(event) {
        if (event.buttons == 1) {
            seekEvent(event);
        }
    }

    // // Allow a bit of dragging outside of the canvas
    document.onmousemove = function(event) {
        if (drag) {
            switch (dragI) {
                case 0:
                case 1:
                    range[dragI] = Math.min(Math.max(event.offsetX / canvasOverview.width, dragI == 0 ? 0 : range[0]), dragI == 0 ? range[1] : 1);
                    break;
                case 2:
                    var goal = (event.offsetX - dragOffsetX) / canvasOverview.width;
                    range[0] = Math.min(Math.max(goal, 0), 1 - dragWidth);
                    range[1] = range[0] + dragWidth;
                    break;
            }

            alignData();
        }
    }

    // // Stop dragging
    document.onmouseup = function(event) {
        drag = false;
        alignData();
    }

    // // Start dragging
    canvasOverview.onmousedown = function(event) {
        if (!drag && event.buttons == 1) {
            if (Math.abs((event.offsetX / canvasOverview.width) - range[0]) < 0.005) {
                drag = true;
                dragI = 0;
            }
            else if (Math.abs((event.offsetX / canvasOverview.width) - range[1]) < 0.005) {
                drag = true;
                dragI = 1;
            }
            else {
                drag = true;
                dragI = 2;
                dragWidth = range[1] - range[0];
                dragOffsetX = event.offsetX - (range[0] * canvasOverview.width);
            }
        }
    }

    canvasOverview.onmousemove = function(event) {
        if (Math.abs((event.offsetX / canvasOverview.width) - range[0]) < 0.005 ||
            Math.abs((event.offsetX / canvasOverview.width) - range[1]) < 0.005) {
            document.body.style.cursor = "e-resize";
        }
        else if 
            (event.offsetX / canvasOverview.width > range[0] ||
            (event.offsetX / canvasOverview.width) < range[1]) {
                document.body.style.cursor = "pointer";
            }
        else {
            document.body.style.cursor = "default";
        }
    }

    canvasOverview.onmouseleave = function(event) {
        document.body.style.cursor = "default";
    }

    render();
}

// Return the sample at the time in the current audioBuffer
function getSampleAt(time) {
    if (audioBuffer) {
        var samples = audioBuffer.getChannelData(0);
        return samples[Math.floor((time / audioElem.duration) * samples.length)];
    }
    return 0;
}

// Helper method for mouse click event that moves the current time of the audio
function seekEvent(event) {
    console.log(event)
    var nx = event.offsetX / canvasMain.width;
    
    if (audioElem.readyState != 0) {
        var base = range[0] * audioElem.duration;
        var zoomWidth = (range[1] * audioElem.duration) - (range[0] * audioElem.duration);
        var clickTime = nx * zoomWidth;

        audioElem.currentTime = base + clickTime;
        document.getElementById("time-sample").value = "Time: (" + audioElem.currentTime + ") | Sample (" + getSampleAt(audioElem.currentTime) + ")"
    }
}

// For small buffers that can be rebound easily
function updateDrawBuffer(glctx, program, source) {
    var vBuffer = glctx.createBuffer();
    glctx.bindBuffer(glctx.ARRAY_BUFFER, vBuffer);
    glctx.bufferData(glctx.ARRAY_BUFFER, Float32Array.from(source), glctx.STATIC_DRAW);

    var vPosition = glctx.getAttribLocation(program, "vPosition");
    glctx.vertexAttribPointer(vPosition, 2, glctx.FLOAT, false, 0, 0);
    glctx.enableVertexAttribArray(vPosition);

    glctx.drawArrays(glctx.LINE_STRIP, 0, source.length / 2);

    glctx.disableVertexAttribArray(vPosition);
}

function render() {
    glMain.clear(glMain.COLOR_BUFFER_BIT);
    
    glMain.uniform4fv(glMain.getUniformLocation(programMain, "color"), [77.0/255.0, 19.0/255.0, 209.0/255.0, 1.0])
    
    // Draw the baseline
    updateDrawBuffer(glMain, programMain, baseLine);
    
    // If the data has been initalized (some audio was loaded)
    if (waveData[SampleType.FULL]) {
        // Disable all other pointers
        for (var i = 1; i <= 2; i++) {
            glMain.disableVertexAttribArray(waveAttribsMain[i]);
        }
        // Enable the current mode pointer
        glMain.enableVertexAttribArray(waveAttribsMain[waveMode]);

        glMain.uniform1i(glMain.getUniformLocation(programMain, "sampleMode"), waveMode);
        glMain.uniform2fv(glMain.getUniformLocation(programMain, "dataSize"), [dataMin, dataMax]);

        glMain.drawArrays(glMain.LINE_STRIP, 0, waveData[waveMode].length / 2);
    }

    // Set back to normal drawing with no sampling
    glMain.uniform1i(glMain.getUniformLocation(programMain, "sampleMode"), SampleType.NONE);

    // Draw the "Current Time" line
    if (audioElem.readyState != 0) {
        if (audioElem.currentTime > range[0] * audioElem.duration && audioElem.currentTime < range[1] * audioElem.duration) {
            var t = -1 + ((audioElem.currentTime - (range[0] * audioElem.duration)) / ((range[1] - range[0]) * audioElem.duration) * 2);
            waveLine = [t, -1, t, 1];
            glMain.uniform4fv(glMain.getUniformLocation(programMain, "color"), [242.0/255.0, 38.0/255.0, 19.0/255.0, 1.0])
            updateDrawBuffer(glMain, programMain, waveLine);
        }
    }

    // Draw overview stuff
    if (useOverview) {
        glOverview.clear(glOverview.COLOR_BUFFER_BIT);
        glOverview.uniform4fv(glOverview.getUniformLocation(programOverview, "color"), [77.0/255.0, 19.0/255.0, 209.0/255.0, 1.0])

        // Draw the baseline
        updateDrawBuffer(glOverview, programOverview, baseLine);

        // Draw the entire sample on the overview
        if (glOverview && waveData[SampleType.PEAKS]) {
            glMain.disableVertexAttribArray(waveAttribsOverview[SampleType.FULL]);
            glMain.enableVertexAttribArray(waveAttribsOverview[SampleType.PEAKS]);

            //glOverview.uniform1i(glOverview.getUniformLocation(programOverview, "sampleMode"), 1);
            glOverview.uniform1i(glOverview.getUniformLocation(programOverview, "sampleMode"), SampleType.PEAKS);
            glOverview.uniform2fv(glOverview.getUniformLocation(programOverview, "dataSize"), [0, waveData[SampleType.FULL].length/2]);
            
            //glOverview.drawArrays(glMain.LINE_STRIP, 0, waveData.length);
            glOverview.drawArrays(glOverview.LINE_STRIP, 0, waveData[SampleType.PEAKS].length/2);
        }
        
        // Set back to normal drawing with no sampling
        glOverview.uniform1i(glOverview.getUniformLocation(programOverview, "sampleMode"), SampleType.NONE);
        
        glOverview.uniform4fv(glOverview.getUniformLocation(programOverview, "color"), [242.0/255.0, 38.0/255.0, 19.0/255.0, 1.0])

        // Normalize range (0-1) to be between -1 and 1
        var min = (2 * ((range[0] - 0) / (1 - 0))) - 1;
        var max = (2 * ((range[1] - 0) / (1 - 0))) - 1;
        updateDrawBuffer(glOverview, programOverview, [min, -1, min, 1]);
        updateDrawBuffer(glOverview, programOverview, [max, -1, max, 1]);
    }

    requestAnimationFrame(render);
}

// Initalize audio data and buffers
function initData() {
    if (audioBuffer) {
        var channelData = audioBuffer.getChannelData(0);

        waveData[SampleType.FULL] = [];
        // Always store first sample value for peaks sampling
        waveData[SampleType.PEAKS] = [0, channelData[0]];

        // Keep track of when the sample crosses the baseline
        var flip = -Math.sign(channelData[0]);
        var topPeak = 0;
        if (flip == 0) { flip = 1; }

        for (var i = 0; i < channelData.length; i++) {
            waveData[SampleType.FULL].push(i);
            waveData[SampleType.FULL].push(channelData[i]);
            
            // Keep track of zero crossing to store peaks
            if (i > 0 && i < channelData.length-1) {
                if (flip == -1) {
                    if (channelData[i] > channelData[topPeak]) {
                        topPeak = i;
                    }
                }
                else {
                    if (channelData[i] < channelData[topPeak]) {
                        topPeak = i;
                    }
                }
    
                if (Math.sign(channelData[i]) == flip) {
                    waveData[SampleType.PEAKS].push(topPeak);
                    waveData[SampleType.PEAKS].push(channelData[topPeak]);
                    flip = -flip;
                    topPeak = i;
                }
            }
        }
        // Always store last sample value
        waveData[SampleType.PEAKS].push(channelData.length-1);
        waveData[SampleType.PEAKS].push(channelData[channelData.length-1]);

        // Bind data buffer for main context
        var dBuffer = glMain.createBuffer();
        glMain.bindBuffer(glMain.ARRAY_BUFFER, dBuffer);
        glMain.bufferData(glMain.ARRAY_BUFFER, Float32Array.from(waveData[SampleType.FULL]), glMain.STATIC_DRAW);

        waveAttribsMain[SampleType.FULL] = glMain.getAttribLocation(programMain, "sample");
        glMain.vertexAttribPointer(waveAttribsMain[SampleType.FULL], 2, glMain.FLOAT, false, 0, 0);
        glMain.enableVertexAttribArray(waveAttribsMain[SampleType.FULL]);

        // Bind data buffer for overview context
        var dBuffer = glOverview.createBuffer();
        glOverview.bindBuffer(glOverview.ARRAY_BUFFER, dBuffer);
        glOverview.bufferData(glOverview.ARRAY_BUFFER, Float32Array.from(waveData[SampleType.FULL]), glOverview.STATIC_DRAW);

        waveAttribsOverview[SampleType.FULL] = glOverview.getAttribLocation(programOverview, "sample");
        glOverview.vertexAttribPointer(waveAttribsOverview[SampleType.FULL], 2, glOverview.FLOAT, false, 0, 0);
        glOverview.enableVertexAttribArray(waveAttribsOverview[SampleType.FULL]);

        // Bind the peaks buffer for main context
        var pBuffer = glMain.createBuffer();
        glMain.bindBuffer(glMain.ARRAY_BUFFER, pBuffer);
        glMain.bufferData(glMain.ARRAY_BUFFER, Float32Array.from(waveData[SampleType.PEAKS]), glMain.STATIC_DRAW);

        waveAttribsMain[SampleType.PEAKS] = glMain.getAttribLocation(programMain, "peaks");
        glMain.vertexAttribPointer(waveAttribsMain[SampleType.PEAKS], 2, glMain.FLOAT, false, 0, 0);
        glMain.enableVertexAttribArray(waveAttribsMain[SampleType.PEAKS]);

        // Bind the peaks buffer for overview context
        var pBuffer = glOverview.createBuffer();
        glOverview.bindBuffer(glOverview.ARRAY_BUFFER, pBuffer);
        glOverview.bufferData(glOverview.ARRAY_BUFFER, Float32Array.from(waveData[SampleType.PEAKS]), glOverview.STATIC_DRAW);

        waveAttribsOverview[SampleType.PEAKS] = glOverview.getAttribLocation(programOverview, "peaks");
        glOverview.vertexAttribPointer(waveAttribsOverview[SampleType.PEAKS], 2, glOverview.FLOAT, false, 0, 0);
        glOverview.enableVertexAttribArray(waveAttribsOverview[SampleType.PEAKS]);
    }
}

// Align the data to the current dataMin/Max range
function alignData() {
    if (audioBuffer) {
        var samples = audioBuffer.getChannelData(0);

        dataMin = Math.floor(range[0] * samples.length);
        dataMax = Math.floor(range[1] * samples.length);

        var limit = audioBuffer.sampleRate*50;

        if (dataMax - dataMin < limit) {
            waveMode = SampleType.FULL;
        }
        else {
            waveMode = SampleType.PEAKS;
        }
    }
}

/**
 * Return a byte array of length numBytes that contains the value of long.
 * @param {long} long The long value to set the bytes to
 * @param {int} numBytes The length of the final bytes array
 * @return {Array} The byte array created from the long value of length numBytes
 */
function longToByteArray(long, numBytes) {
    var byteArray = []
    for (var i = 0; i < numBytes; i++) {
        byteArray.push(0);
    }

    for (var i = 0; i < byteArray.length; i++) {
        var byte = long & 0xff;
        byteArray[i] = byte;
        long = (long - byte) / 256 ;
    }

    return byteArray;
}

/**
 * Return an ArrayBuffer built from a base64 string
 * @param {String} b64 The base64 string
 * @return {ArrayBuffer} The ArrayBuffer built from the b64 string
 */
function base64ToArrayBuffer(b64) {
    var binary_string = window.atob(b64);
    var bytes = new Uint8Array(binary_string.length);
    for (var i = 0; i < binary_string.length; i++)        {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

/**
 * Return an Array built from a base64 string 
 * @param {String} b64 The base64 string
 * @return {Array} The Array built from the b64 string
 * 
 */
function base64ToArray(b64) {
    console.log(b64)
    var binary_string = window.atob(b64);
    var bytes = [];
    for (var i = 0; i < binary_string.length; i++)        {
        bytes.push(binary_string.charCodeAt(i));
    }
    return bytes;
}

// Called once a file is input
function onInputChange(data) {
    // Create or resume AudioContext
    if (audioContext == null) {    
        audioContext = new AudioContext();
    }
    else {
        audioContext.resume();
    }

    // Read the JSON and create a ByteArray with the structure of a wave file
    wavBytes = JSONToWaveBytes(data);
    decodeByteArray(wavBytes);
    
}

/**
 * Return a ByteArray of a JSON String
 * The JSON must contain 
 *  numChannels: The number of channels that the wave file contains
 *  sampleRate: The sample rate of the wave file
 *  numSamples: The number of samples over the full wave file
 *  samples: A base64 string of the sample data from the wave file
 * 
 * @param {String} jsonString The JSON file as a text string
 * @returns {Uint8Array} The ByteArray in the format of a wave file
 */
function JSONToWaveBytes(jsonString) {
    console.log(jsonString)
    // var results = JSON.parse(str(jsonString));
    var byteRate = jsonString.sampleRate * jsonString.numChannels * jsonString.bitsPerSample / 8;
    var blockAlign = jsonString.numChannels * jsonString.bitsPerSample / 8;
    var subChunk2Size = jsonString.numSamples * jsonString.numChannels * (jsonString.bitsPerSample / 8);
    var chunkSize = 36 + subChunk2Size;

    var data = [];
    
    // Chunk ID - 4 bytes
    for (var i = 0; i < 4; i++) {
        data.push("RIFF".charCodeAt(i));
    }

    // Chunk Size - 4 bytes
    data = data.concat(longToByteArray(chunkSize, 4));
    
    // Format - 4 bytes
    for (var i = 0; i < 4; i++) {
        data.push("WAVE".charCodeAt(i));
    }

    // Sub Chunk 1 ID - 4 bytes
    for (var i = 0; i < 4; i++) {
        data.push("fmt ".charCodeAt(i));
    }

    // Sub Chunk 1 Size - 4 bytes
    data = data.concat(longToByteArray(16, 4));
    // Audio Format - 2 bytes
    data = data.concat(longToByteArray(1, 2));
    // Number of Channels - 2 bytes
    data = data.concat(longToByteArray(jsonString.numChannels, 2));
    // Sample Rate - 4 bytes
    data = data.concat(longToByteArray(jsonString.sampleRate, 4));
    // Byte Rate - 4 bytes
    data = data.concat(longToByteArray(byteRate, 4));
    // Block Align - 2 bytes
    data = data.concat(longToByteArray(blockAlign, 2));
    // Bits Per Sample - 2 bytes
    data = data.concat(longToByteArray(jsonString.bitsPerSample, 2));

    // Sub Chunk 2 ID - 4 bytes
    for (var i = 0; i < 4; i++) {
        data = data.concat("data".charCodeAt(i));
    }

    // Sub Chunk 2 Size - 4 bytes
    data = data.concat(longToByteArray(subChunk2Size, 4));
    // Sample Data - variable bytes
    data = data.concat(base64ToArray(jsonString.samples));
    
    return new Uint8Array(data);
}

/**
 * Decode the ByteArray of wave formatted audio data then display it to peaks
 * @param {Uint8Array} byteArray 
 */
function decodeByteArray(byteArray) {
    var aBuffer = new Uint8Array(byteArray.length);
    aBuffer.set(new Uint8Array(byteArray), 0);

    audioContext.decodeAudioData(aBuffer.buffer, setupPeaks);
}

/**
 * Setup peaks using the AudioBuffer. This will set the audio element to the AudioBuffer,
 * Then update peaks with the new AudioBuffer info.
 * @param {AudioBuffer} buffer
 */
function setupPeaks(buffer) {
    audioBuffer = buffer;
    var blob = new Blob([wavBytes], {type: "audio/wav"});
    document.getElementById("audio").src = URL.createObjectURL(blob);
    
    initData();
    alignData();
}




























































// var source
// var audioC;  
// var audioBuffer;

// var data;

// function init(vis, vis_index, assignmentData) {
//     // Set up the audio context
//     if (!window.AudioContext) {
//         if (!window.webkitAudioContext) {
//             alert("Web Audio API not supported in this browser.");
//             return;
//         }
//         window.AudioContext = window.webkitAudioContext;
//     }

//     assign_data = assignmentData

//     audioC = new AudioContext();

//     onInputChange();

//     document.querySelector('button').addEventListener('click', function() {
//         audioC.resume().then(() => {
//         console.log('Playback resumed successfully');
//         });
//     });

// }



//  function longToByteArray(long, numBytes) {
//     var byteArray = []
//     for (var i = 0; i < numBytes; i++) {
//         byteArray.push(0);
//     }

//     for (var i = 0; i < byteArray.length; i++) {
//         var byte = long & 0xff;
//         byteArray[i] = byte;
//         long = (long - byte) / 256 ;
//     }

//     return byteArray;
// }

// function base64ToArrayBuffer(b64) {
//     var binary_string = window.atob(b64);
//     var bytes = new Uint8Array(binary_string.length);
//     for (var i = 0; i < binary_string.length; i++)        {
//         bytes[i] = binary_string.charCodeAt(i);
//     }
//     return bytes.buffer;
// }

// function base64ToArray(b64) {
//     var binary_string = window.atob(b64);
//     var bytes = [];
//     for (var i = 0; i < binary_string.length; i++)        {
//         bytes.push(binary_string.charCodeAt(i));
//     }
//     return bytes;
// }

// function onInputChange(event) {
            
//             var byteRate = assign_data.sampleRate * assign_data.numChannels * assign_data.bitsPerSample / 8;
//             var blockAlign = assign_data.numChannels * assign_data.bitsPerSample / 8;
//             var subChunk2Size = assign_data.numSamples * assign_data.numChannels * (assign_data.bitsPerSample / 8);
//             var chunkSize = 36 + subChunk2Size;

//             var data = [];
            
//             // Chunk ID - 4 bytes
//             for (var i = 0; i < 4; i++) {
//                 data.push("RIFF".charCodeAt(i));
//             }

//             // Chunk Size - 4 bytes
//             data = data.concat(longToByteArray(chunkSize, 4));
            
//             // Format - 4 bytes
//             for (var i = 0; i < 4; i++) {
//                 data.push("WAVE".charCodeAt(i));
//             }

//             // Sub Chunk 1 ID - 4 bytes
//             for (var i = 0; i < 4; i++) {
//                 data.push("fmt ".charCodeAt(i));
//             }

//             // Sub Chunk 1 Size - 4 bytes
//             data = data.concat(longToByteArray(16, 4));
//             // Audio Format - 2 bytes
//             data = data.concat(longToByteArray(1, 2));
//             // Number of Channels - 2 bytes
//             data = data.concat(longToByteArray(assign_data.numChannels, 2));
//             // Sample Rate - 4 bytes
//             data = data.concat(longToByteArray(assign_data.sampleRate, 4));
//             // Byte Rate - 4 bytes
//             data = data.concat(longToByteArray(byteRate, 4));
//             // Block Align - 2 bytes
//             data = data.concat(longToByteArray(blockAlign, 2));
//             // Bits Per Sample - 2 bytes
//             data = data.concat(longToByteArray(assign_data.bitsPerSample, 2));

//             // Sub Chunk 2 ID - 4 bytes
//             for (var i = 0; i < 4; i++) {
//                 data = data.concat("data".charCodeAt(i));
//             }

//             // Sub Chunk 2 Size - 4 bytes
//             data = data.concat(longToByteArray(subChunk2Size, 4));
//             // Sample Data - variable bytes
//             data = data.concat(base64ToArray(assign_data.samples));

//             var bytes = new Uint8Array(data);
//             playByteArray(bytes);
// }

// function playByteArray(byteArray) {
//     audioBuffer = new Uint8Array(byteArray.length);
//     audioBuffer.set(new Uint8Array(byteArray), 0);

//     audioC.decodeAudioData(audioBuffer.buffer, play);
// }

// function play(buffer) {
//     // Testing just makes the sound white noise
//     // for (var ch = 0; ch < buffer.numberOfChannels; ch++) {
//     //     cd = buffer.getChannelData(ch);
//     //     for (var i = 0; i < cd.length; i++) {
//     //         cd[i] = Math.random() * 2 - 1;
//     //     }
//     // }

//     source = audioC.createBufferSource();
//     audioBuffer = buffer;
//     source.buffer = audioBuffer;
//     source.connect(audioC.destination);
//     source.start(0);
//     // drawChart();
// }

// google.charts.load('current', {'packages':['corechart']});
// google.charts.setOnLoadCallback(drawChart);

// function drawChart() {
//     if (audioBuffer==undefined) {
//         return;
//     }

//     var arr = [['SampleIndex', 'Sample']];

//     // Only Display the first channel
//     cd = audioBuffer.getChannelData(0);
//     for (var i = 0; i < cd.length; i+=500) {
//         arr.push([i, cd[i]])
//     }

//     var data = google.visualization.arrayToDataTable(arr);

//     var options = {
//       title: 'Audio Waveform Chart',
//       curveType: 'function',
//       hAxis: {title: 'Samples',  titleTextStyle: {color: '#333'}},
//       //vAxis: {minValue: -1, maxValue: 1},
//       explorer: {axis: 'horizontal'},
//     };

//     var chart = new google.visualization.LineChart(document.getElementById('vis0'));
//     chart.draw(data, options);
//   }

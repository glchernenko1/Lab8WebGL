// Рисует зелёный треугольник

"use strict";

// Исходный код вершинного шейдера

const vsSource = `#version 300 es

// Координаты вершины. Атрибут, инициализируется через буфер.
in vec2 vertexPosition;
in vec2 texturePosition; 

out vec2 _texturePosition;

void main() {
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
    _texturePosition = vec2(vertexPosition.x, vertexPosition.y);
}
`;

// Исходный код фрагментного шейдера
const fsSource = `#version 300 es
// WebGl требует явно установить точность флоатов, так что ставим 32 бита

precision mediump float;

in vec2 _texturePosition;

uniform vec4 inColor;

uniform float fRot;

//texture
uniform sampler2D sampler;  



out vec4 color;
void main() {
    vec2 text = _texturePosition;
    float ph = length(text);
    float cos_ = cos(fRot*ph); 
    float sin_ = sin(fRot*ph); 
    
    vec2 newTextureCoords;
    newTextureCoords.x = text.x*cos_-text.y*sin_;
     newTextureCoords.y = text.x*sin_+text.y*cos_;
    newTextureCoords = newTextureCoords/2.0 - 0.5;
    color = texture(sampler, (newTextureCoords));
}
`;




let rotate=0;

window.onload = function main() {

    console.log('1');

    // Получаем канвас из html
    const canvas = document.querySelector("#gl_canvas");
    // Получаем контекст webgl2
    const gl = canvas.getContext("webgl2");

    // Обработка ошибок
    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }
    // Устанавливаем размер вьюпорта  
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    console.log('1');

    // Создаём шейдерную программу
    const shaderProgram = initShaderProgram(gl, vsSource, fsSource);
    // Для удобства создадим объект с информацией о программе
    const programInfo = {
        // Сама программа
        program: shaderProgram,
        // Расположение параметров-аттрибутов в шейдере
        attribLocations: {
            vertexPosition: gl.getAttribLocation(shaderProgram, 'vertexPosition'),
            texturePosition: gl.getAttribLocation(shaderProgram, 'texturePosition'),

        },
        uniformLocation:{
            color: gl.getUniformLocation(shaderProgram,  'inColor'),
            sampler: gl.getUniformLocation(shaderProgram, 'sampler'),
            fRot: gl.getUniformLocation(shaderProgram, 'fRot'),
        },

    };

    // Инициализируем буфер
    const buffers = initBuffer(gl)

    drawScene(gl, programInfo, buffers);

    window.onkeydown = (e) => {
        switch (e.key) {
            case "a":
                rotate += 0.05;
                break;
            case "d":
                rotate -=0.05;
                break;
        }
        drawScene(gl, programInfo, buffers);
    }



}



// Инициализируем и заполняем буфер вершин кубика
function initBuffer(gl) {

    // 4х угольник
    const point = [
            [-1, -1],
            [-1, +1],
            [+1, -1],
            [+1,+1]
        ] // Превращаем в плоский массив

    const positions = [
        [point[0], point[1], point[2]],
        [point[1],point[2], point[3]]
    ].flat(2)

    const positionBuffer = makeF32ArrayBuffer(gl, positions);



    return {
        positionBuffer,
        bufferLength: positions.length,
    };
}

//запись координат тексура
function textureCordBuffer(gl){

    const point = [
        [-1, -1],
        [-1, +1],
        [+1, -1],
        [+1,+1]
    ];

    const position = new Float32Array(
            [
                [point[0], point[1], point[2]],
                [point[1],point[2], point[3]]
            ].flat(2));

    gl.bufferData(gl.ARRAY_BUFFER, position, gl.STATIC_DRAW);

}

function makeF32ArrayBuffer(gl, array) {
    // Создаём буфер
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Заполняем буффер массивом флоатов
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(array),
        gl.STATIC_DRAW
    );

    return buffer
}

function loadImg( id ) {
    var out = new Image();
    out.crossOrigin= "anonymous";
    out.src = id;
    return out;
}

function drawScene(gl, programInfo, buffers) {


    console.log('1');

    gl.useProgram(programInfo.program);
    // Чистим экран
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    console.log('1');

    // Подключаем VBO
    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.positionBuffer);
    // Указываем формат данных, содержащихся в буфере
    gl.vertexAttribPointer(
        // Позиция параметра в шейдере, которую вы сохранили заранее
        programInfo.attribLocations.vertexPosition,
        // Количество компонент. У нас 2, потому что мы передаём только координаты x, y.
        2,
        // Тип элемента. У нас 32-битный флоат.
        gl.FLOAT,
        // Нормализация нужна только для целочисленных параметров
        false,
        // Расстояние между компонентами нулевое
        0,
        // Сдвиг от начала не нужен
        0
    );
    gl.enableVertexAttribArray(
        programInfo.attribLocations.vertexPosition
    );
    console.log('1');



    textureCordBuffer(gl);


    // Устанавливаем используемую программу


    console.log('1');

    let texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 0, 0, 255]));

    let img = loadImg(document.getElementById('2222').src);

    console.log(img)

    gl.activeTexture(gl.TEXTURE0);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);


    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.generateMipmap(gl.TEXTURE_2D);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    gl.uniform1i(programInfo.uniformLocation.sampler, 0);

    gl.uniform4fv(programInfo.uniformLocation.color, [0.0,0.0,1.0,1.0]);

    gl.uniform1f(programInfo.uniformLocation.fRot, rotate);



    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);


    gl.drawArrays(
        // Рисуем по треугольникам
        gl.TRIANGLES,
        // Сдвиг от начала не нужен 
        0,
        // Количество вершин в буфере
        buffers.bufferLength
    );


}

//////////// Мусорррр

function loadShader(gl, type, source) {
    // Создаём шейдер
    const shader = gl.createShader(type);

    // Компилируем шейдер
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    // Обрабатываем ошибки
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Функция инициализации шейдерной программы
function initShaderProgram(gl, vsSource, fsSource) {
    // Загружаем вершинный шейдер
    const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
    // Загружаем фрагментный шейдер
    const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

    //Создаём программу и прикрепляем шейдеры к ней
    const shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // Обрабатываем ошибки
    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
        return null;
    }

    return shaderProgram;
}
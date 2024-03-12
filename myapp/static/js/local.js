$(document).ready(function () {
    // 使用事件委托绑定点击事件到 #local-img-box
    $('#local-img-box').on('click', 'img', function () {
        var imgSrc = $(this).attr('src'); // 获取被点击的图片的src
        $('#imagePreview').attr('src', imgSrc).show(); // 设置imagePreview的src为被点击图片的src，并显示imagePreview

        // 清除canvas内容
        var canvas = $('#local-canvas')[0];
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除画布上的所有内容
    });

    // 当Manuscript按钮被点击时
    $('#Manuscript-Gen-Image').click(function () {
        img_gen_type = 'Manuscript-Image'
        // 触发文件输入的点击事件，打开文件选择对话框
        $('#localImageChooser').click();
    });
    //
    $('#localAddImg').click(function () {
        // 触发文件输入的点击事件，打开文件选择对话框
        $('#localImageChooser').click();
    });

    // 当文件输入变化，即用户选择了文件时
    $('#localImageChooser').change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                // 显示图片预览
                $('#imagePreview').attr('src', e.target.result).show();
            };

            // 读取选中的文件并将其作为URL显示
            reader.readAsDataURL(this.files[0]);
        }

    });

    // 图片融合
    $('#Mix-Image').click(async function () {
        img_gen_type = 'Mix-Image'
        // 触发文件输入的点击事件，打开文件选择对话框
        $('#localMixImageChooser').click();

    });

    // 当文件输入变化，即用户选择了文件时
    $('#localMixImageChooser').change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();

            reader.onload = function (e) {
                // 显示图片预览
                $('#MixImage').attr('src', e.target.result).show();
            };

            // 读取选中的文件并将其作为URL显示
            reader.readAsDataURL(this.files[0]);
        }

    });


    // 画布操作 图层遮罩
    //#region
    var $canvas = $('#local-canvas');
    var $localimg = $('#imagePreview')
    var ctx = $canvas[0].getContext('2d');
    var isDrawing = false;
    var lastX = 0;
    var lastY = 0;

    var brushSize = 20; // 初始化画笔大小
    var $brushSizeIndicator = $('.brush-size-indicator');
    ctx.lineWidth = brushSize; // 设置初始的线宽

    // 确保画布的大小匹配图像大小
    function resizeCanvas(width = $localimg.width(), hight = $localimg.height()) {
        $canvas.attr('width', width); // 设置canvas宽度
        $canvas.attr('height', hight); // 设置canvas高度
        $canvas.css('opacity', '0.6');

    }


    // 绘制遮罩的函数
    function drawMask(x, y) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = 'rgb(255,255,255)'; // 遮罩颜色
        ctx.lineWidth = brushSize;                   // 遮罩宽度
        ctx.lineCap = 'round';                // 线条末端形状
        ctx.stroke();
        lastX = x;
        lastY = y;
    }

    $canvas.mousedown(function (e) {
        isDrawing = true;
        lastX = e.offsetX;
        lastY = e.offsetY;
    });

    $canvas.mousemove(function (e) {
        if (isDrawing) {
            drawMask(e.offsetX, e.offsetY);
        }
    });

    $canvas.on('mouseup mouseleave', function () {
        isDrawing = false;
    });

    //启动擦除模式
    $('#Erase-Image').on('click', function () {
        img_gen_type = 'Erase-Image';
        loadImageToCanvas($localimg.attr('src')); // 加载图片到画布
        ctx.globalCompositeOperation = 'destination-out'; // 激活擦除模式

    });


    // 启动涂鸦模式
    $('#Edits-Image').on('click', function () {
        img_gen_type = 'Edits-Image'
        ctx.globalCompositeOperation = 'source-over';
        resizeCanvas();
    });

    // 清除按钮的功能
    $('#local-image-clean').click(clearCanvas);

    // 清除画布的函数
    function clearCanvas() {
        ctx.clearRect(0, 0, $canvas.width(), $canvas.height());
        resizeCanvas(0, 0)

        ctx.globalCompositeOperation = 'source-over';
        isDrawing = false;

    }

    // 当窗口大小改变时调整画布大小
    $(window).resize(resizeCanvas);


    // Event handler for decreasing brush size
    $('#decreaseBrush').click(function () {
        if (brushSize > 1) { // Prevent brush size from going below 1
            brushSize -= 1; // Decrease brush size
            updateBrushIndicator(brushSize);
        }
    });

    // Event handler for increasing brush size
    $('#increaseBrush').click(function () {
        brushSize += 1; // Increase brush size
        updateBrushIndicator(brushSize);
    });

    // 初始更新画笔大小指示器
    updateBrushIndicator(brushSize);

    // 更新画笔大小指示器并同步画布的线宽
    function updateBrushIndicator(size) {
        $brushSizeIndicator.css({
            'width': size + 'px',
            'height': size + 'px'
        });
        ctx.lineWidth = size; // 同步更新画布的笔迹宽度
    }

    function loadImageToCanvas(src) {
        const img = new Image();
        img.onload = function () {
            // 使用 #imagePreview 的尺寸而不是图像的原始尺寸
            resizeCanvas($localimg.width(), $localimg.height());
            // 将图像等比例缩放绘制到画布上，填满整个画布
            // 可能需要调整这里的代码以保持图像比例，以下是一种方法
            const scale = Math.min($canvas.width() / img.width, $canvas.height() / img.height);
            const x = ($canvas.width() / 2) - (img.width / 2) * scale;
            const y = ($canvas.height() / 2) - (img.height / 2) * scale;
            ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        };
        img.src = src;
    }

    //#endregion
});


// 点击生成 执行遮罩转换 修改为Mask遮罩图
// 将绘制的内容转换为遮罩图
// 使用方式：
async function convertToMask(_canvas, _imageSrc) {
    const size = await getImageOriginSize(_imageSrc);
    const canvas = _canvas;
    const ctx = canvas.getContext('2d');

    // 获取画布的ImageData
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 遍历像素，将绘制的部分转换为白色，其余部分为黑色
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // 如果alpha值大于0，即非透明的
            data[i] = 255; // 设置为白色
            data[i + 1] = 255;
            data[i + 2] = 255;
        } else { // 否则，设置为黑色
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
        }
        data[i + 3] = 255; // 完全不透明
    }

    // 将修改后的图像数据放回画布
    ctx.putImageData(imageData, 0, 0);

    // 创建一个新的Canvas，用于输出最终的遮罩图
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = size.width;
    exportCanvas.height = size.height;
    const exportCtx = exportCanvas.getContext('2d');
    exportCtx.drawImage(canvas, 0, 0, size.width, size.height);

    // 返回一个Promise，该Promise解析为遮罩图的DataURL
    return new Promise((resolve) => {
        resolve(exportCanvas.toDataURL());
    });
}


// 函数：获取图像的原始尺寸
function getImageOriginSize(src) {
    return new Promise((resolve) => {
        const image = new Image();
        image.src = src;
        image.onload = () => {
            resolve({
                width: image.naturalWidth,
                height: image.naturalHeight
            });
        };
    });
}
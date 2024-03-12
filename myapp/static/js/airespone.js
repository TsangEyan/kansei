$(document).ready(function () {

    // 输入feature 输出Prompt
    $('#prompt-generate').click(function () {
        var featureData = getFeature();
        sendDataToBackend(featureData).then(() => {
            addPrompt()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    });

    // 输入prompt生成图片
    $('#image-generate').click(async function () {
        var promptData = getPrompt();
        console.log(promptData)
        sendDataToBackend(promptData).then(() => {
            addImage()
        }).catch((error) => {
            console.log("Error while sending data: ", error);
        });

    })

    $('#local-image-generate').click(async function () {
        console.log("Button clicked");
        if (img_gen_type === 'Edits-Image') {
            console.log("Edits-Image-change base 64")
            var ImgData = await getLocalEditsImg();
            console.log("Edits-Image-change base 64 done")
            await sendDataToBackend(ImgData).then(() => {
                addLocalImage()
            }).catch((error) => {
                console.log("Error while sending data: ", error);
            });

        } else if (img_gen_type === 'Erase-Image') {
            console.log("Erase-Image-change base 64")
            var ImgData = await getLocalEraseImg();
            console.log("Erase-Image-change base 64 done")
            await sendDataToBackend(ImgData).then(() => {
                addLocalImage()
            }).catch((error) => {
                console.log("Error while sending data: ", error);
            });

        } else if (img_gen_type === 'Mix-Image') {
            console.log("Mix-Image-change base 64")
            var mixImgData = await getLocalMixImg();
            console.log("Mix-Image-change base 64 done")
            await sendDataToBackend(mixImgData).then(() => {
                addLocalImage()
            }).catch((error) => {
                console.log("Error while sending data: ", error);
            });

        } else if (img_gen_type === 'Manuscript-Image') {
            console.log("Manuscript-Image base 64")
            var ImgData = await getLocalManuscriptImg();
            console.log("Manuscript-Image base 64 done")
            await sendDataToBackend(ImgData).then(() => {
                addLocalImage()
            }).catch((error) => {
                console.log("Error while sending data: ", error);
            });
        }
    });

});

/**
 * 构造并返回包含选中特性的 FormData 对象。
 * 此函数遍历所有位于 .checkboxes-container 容器内的 .check-box 元素。
 * 对于每个包含被选中复选框的 .check-box，其相应的 textarea 中的文本值会被添加到 FormData 对象中。
 * 每个选中的特性都以 "features[]" 为键添加到 FormData 中，允许在服务器端接收到一个特性数组。
 * 这使得处理提交的特性数据更加灵活，特别是当需要处理多个特性时。
 *
 * @returns {FormData} 包含所有选中特性的 FormData 对象。特性值来自对应的 textarea 元素。
 */
function getFeature() {
    var featureData = new FormData();
    var feature = [];
    featureData.append('designID', 'Feature2Prompt')


    $('.checkboxes-container .check-box').each(function () {
        var $checkbox = $(this).find('input[type="checkbox"]');
        var $textarea = $(this).find('textarea');

        if ($checkbox.is(':checked')) {
            // // 为每个选中的特性添加一个条目到FormData中
            // featureData.append("features[]", $textarea.val());
            console.log($textarea.val());
            feature.push($textarea.val());
        }
    });
    featureData.append("feature", feature)
    return featureData;
}

function addPrompt() {
    console.log(gpt_response)
    var prompt = Object.values(gpt_response);
    $('#prompt').val(prompt)

}

function getPrompt() {
    var promptData = new FormData();
    promptData.append('designID', 'Prompt2Img')

    var prompt = $('#prompt').val()

    promptData.append("image", prompt)
    return promptData

}

function addImage() {
    console.log(gpt_response)
    var imgList = gpt_response;

    // 清空现有的图片
    $('#global-image-box').empty();

    // 添加新图片
    for (var i = 0; i < imgList.length; i++) {
        $('#global-image-box').append('<img src="/static/' + imgList[i] + '" alt="Image" />');
    }
}

/**
 * Local层 两个图像混合 构造  FormData 对象。
 * 选择图片 后送入后端处理
 * @returns {FormData} 图像
 */
async function getLocalMixImg() {
    try {
        var localMixData = new FormData();
        localMixData.append('designID', 'MixImg')
        // 获取图片的Base64编码
        var imagePreviewBase64 = await convertImageToBase64($('#imagePreview'));
        var mixImageBase64 = await convertImageToBase64($('#MixImage'));


        localMixData.append('img1', imagePreviewBase64)
        localMixData.append('img2', mixImageBase64)

        return localMixData
    } catch (error) {
        console.error("Error converting images to Base64:", error);
    }
}


async function getLocalManuscriptImg() {
    try {
        var localData = new FormData();
        localData.append('designID', 'ManuscriptImg')
        // 获取图片的Base64编码
        var imagePreviewBase64 = await convertImageToBase64($('#imagePreview'));

        localData.append('image', imagePreviewBase64)

        return localData
    } catch (error) {
        console.error("Error converting images to Base64:", error);
    }
}

async function getLocalEditsImg() {
    try {
        var localMixData = new FormData();
        localMixData.append('designID', 'EditsImg')

        // 假设已经完成了绘制，现在转换为遮罩图
        var maskDataURL = await convertToMask($('#local-canvas')[0], $('#imagePreview').attr('src'));
        // 可以在这里使用maskDataURL，比如设置为图片的src或者发送到服务器

        // 获取图片的Base64编码
        var imagePreviewBase64 = await convertImageToBase64($('#imagePreview'));

        // var maskmageBase64 = await convertImageToBase64(maskDataURL);

        localMixData.append('image', imagePreviewBase64)
        localMixData.append('mask', maskDataURL)

        var prompt = $('#localPrompt').val()
        localMixData.append('prompt', prompt)

        return localMixData
    } catch (error) {
        console.error("Error converting images to Base64:", error);
    }
}


async function getLocalEraseImg() {
    try {
        var localEraseData = new FormData();
        localEraseData.append('designID', 'EraseImg')

        const canvas = $('#local-canvas')[0];
        var maskmageBase64 = canvas.toDataURL("image/png");

        var imagePreviewBase64 = await convertImageToBase64($('#imagePreview'));

        localEraseData.append('image', imagePreviewBase64) // 假设您想发送裁剪后的图像
        localEraseData.append('mask', maskmageBase64) // 假设您想发送裁剪后的图像

        var prompt = $('#localPrompt').val()
        localEraseData.append('prompt', prompt)

        return localEraseData
    } catch (error) {
        console.error("Error converting images to Base64:", error);
    }
}

function addLocalImage() {
    console.log(gpt_response)
    var imgList = gpt_response;

    // 清空现有的图片
    $('#local-img-box').empty();

    // 添加新图片
    for (var i = 0; i < imgList.length; i++) {
        $('#local-img-box').append('<img src="/static/' + imgList[i] + '" alt="Image" />');
    }
}



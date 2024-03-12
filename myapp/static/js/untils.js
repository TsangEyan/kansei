var gpt_response = null;
var img_gen_type = 'Local-Gen-Image';

function genRandomID() {
    const randomNumber = Math.floor(Math.random() * 100000) + 1; // 随机生成1～100000的整数
    return randomNumber.toString(); // 转换为字符串
}


function prompt_info(msg) {
    alert(msg);
}


// 后端异步传输
// function sendDataToBackend(formData) {
//     return new Promise((resolve, reject) => {
//         $.ajax({
//             url: "/kansei/",
//             type: "POST",
//
//             // data: dataInput,
//             data: formData,
//             contentType: false,
//             processData: false,
//             dataType: "JSON",
//             headers: {
//                 'X-CSRFToken': getCookie('csrftoken')  // 获取CSRF令牌并将其添加到请求头
//             },
//             success: function (response) {
//                 gpt_response = response
//                 resolve(response); // 解析 Promise
//
//             },
//             error: function (error) {
//                 console.log(error);
//                 reject(error); // 拒绝 Promise
//             }
//         });
//     });
// }

function sendDataToBackend(formData) {
    return new Promise((resolve, reject) => {
        // 确保获取到了有效的 CSRF Token
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            console.error('CSRF token not found. Please ensure you are logged in and the token is available.');
            reject('CSRF token not found');
            return; // 如果没有找到 CSRF token，中断执行
        }

        $.ajax({
            url: "/kansei/",
            type: "POST",
            data: formData,
            contentType: false, // 对于FormData，这应该设置为false
            processData: false, // 对于FormData，这也应该设置为false
            dataType: "json", // 假设后端返回的是JSON格式的数据
            headers: {
                'X-CSRFToken': csrfToken
            },
            success: function (response) {
                console.log('Success:', response);
                gpt_response = response
                resolve(response);
            },
            error: function (xhr, status, error) {
                console.error("Error status:", status);
                console.error("Error response text:", xhr.responseText);
                reject(xhr.responseText || 'Unknown error');
            }
        });
    });
}

// 用于获取cookie的函数
function getCookie(name) {
    let value = "; " + document.cookie;
    let parts = value.split("; " + name + "=");
    if (parts.length === 2) return parts.pop().split(";").shift();
}

// 图片URL转Base64
const convertImageToBase64 = (imgElement) => {
    return new Promise((resolve, reject) => {
        // 确保 imgElement 是一个 jQuery 对象
        const $img = (imgElement instanceof jQuery) ? imgElement : $(imgElement);

        // 获取图片源 URL
        const src = $img.attr('src');
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // 如果需要跨域请求
        img.src = src;

        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.naturalWidth;
            canvas.height = this.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(this, 0, 0);
            const dataURL = canvas.toDataURL();
            resolve(dataURL);
        };

        img.onerror = function (error) {
            reject("Error loading image");
        };
    });
};

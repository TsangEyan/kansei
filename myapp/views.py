from django.http import JsonResponse
from django.shortcuts import render, HttpResponse
import requests
import base64
import os
import openai
from openai import OpenAI
import json
import random, string
from PIL import Image, PngImagePlugin, ImageOps
from io import BytesIO
import io
from pathlib import Path

# Create your views here.
messageList = []


def kansei(request):
    if request.method == 'POST':
        designID = request.POST['designID']

        # 输入feature, 根据feature生成prompt
        if designID == 'Feature2Prompt':
            prompt = request.POST['feature']
            print(prompt)
            response = get_completion_from_messages(
                generate_prompt_from_feature(prompt))
            print(response)
            print(type(response))  # <class 'dict'>
            return JsonResponse(response)

        elif designID == 'Prompt2Img':
            prompt = request.POST['image']
            imgList = generate_img_from_prompt(prompt)
            return JsonResponse(imgList, safe=False)

        elif designID == 'MixImg':
            img1 = request.POST['img1']
            img2 = request.POST['img2']
            print('MixImg sucssful')
            # print(img1)
            # print(img2)
            imgList = generate_mix_img(img1, img2)
            return JsonResponse(imgList, safe=False)

        elif designID == 'ManuscriptImg':
            line_img = request.POST['image']
            imgList = generate_img_from_line(line_img)
            return JsonResponse(imgList, safe=False)

        elif designID == 'EraseImg':
            image = request.POST['image']
            mask_image = request.POST['mask']
            prompt = request.POST['prompt']
            imgList = generate_img_erase(image, mask_image, prompt)
            return JsonResponse(imgList, safe=False)

        elif designID == 'EditsImg':
            print("EditsImgEditsImgEditsImg")
            image = request.POST['image']
            mask_image = request.POST['mask']
            prompt = request.POST['prompt']
            imgList = generate_img_edits(image, mask_image, prompt)
            return JsonResponse(imgList, safe=False)

    return render(request, "kansei.html")


def generate_prompt_from_feature(design):
    messageList.append({'role': 'system',
                        'content': 'You are a designer for automotive exterior design'})

    prompt = f""" A detailed prompt is required to generate a car image with specific information about the desired 
    car as shown in the following car features: ```{design}```It is sufficient to output only one paragraph of text\
    Output dict "prompt":"the answer"\
    I would like to receive a dict format output
            """

    messageList.append({'role': 'user', 'content': prompt})

    print(prompt)
    return messageList


def generate_img_from_prompt(design):
    static_file_path_list = []
    prompt = f"""generate picture of a car, and it has features below```{design}``` """

    print(prompt)
    for _ in range(4):  # 生成四张图片
        response = image_generate(prompt)
        image_url = response.data[0].url
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
        file_name = f'myapp/static/img/gen_output/{random_string}.png'
        static_file_path = f'img/gen_output/{random_string}.png'

        static_file_path_list.append(static_file_path)
        save_image_from_url(image_url, file_name)
        print(f"Image saved as {file_name}")
    print(static_file_path_list)
    return static_file_path_list


def get_completion_from_messages(messages, model="gpt-4-0125-preview", temperature=0.7):
    response = client.chat.completions.create(
        model=model,
        messages=messages,
        temperature=temperature,  # 控制模型输出的随机程度
    )
    #   print(str(response.choices[0].message))

    print(response.choices[0].message)
    print(response.choices[0].message.content)
    response = string2json(response.choices[0].message.content)
    return response


def generate_img_edits(image, mask_image, prompt):
    static_file_path_list = []
    save_base64_image(image, 'myapp/static/img/1.png')
    save_base64_image(mask_image, 'myapp/static/img/1mask.png')

    return static_file_path_list


def generate_img_erase(image, mask_image, prompt):
    static_file_path_list = []

    # 处理图像和蒙版
    processed_image_data = process_base64_image(image)
    processed_mask_data = process_base64_image(mask_image)

    for _ in range(4):  # 生成四张图片
        # 创建BytesIO对象
        image_file = BytesIO(processed_image_data)
        mask_file = BytesIO(processed_mask_data)

        response = image_erase_generate(image_file, mask_file, prompt)
        image_url = response.data[0].url

        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
        file_name = f'myapp/static/img/erase_output/{random_string}.png'
        static_file_path = f'img/erase_output/{random_string}.png'

        static_file_path_list.append(static_file_path)
        save_image_from_url(image_url, file_name)
        print(f"Image saved as {file_name}")
    print(static_file_path_list)
    return static_file_path_list


def image_erase_generate(image_file, mask_file, prompt):
    response = client.images.edit(
        model="dall-e-2",
        image=image_file,
        mask=mask_file,
        prompt=prompt,
        n=1,
        size="1024x1024"
    )
    return response


def image_generate(message):
    response = client.images.generate(
        model="dall-e-3",
        prompt=message,
        size="1792x1024",
        quality="standard",
        n=1,
    )
    return response


def generate_mix_img(base64_image1, base64_image2):
    static_file_path_list = []
    prompt = recognize_multiple_images(base64_image1, base64_image2)

    for _ in range(4):  # 生成四张图片
        response = image_generate(prompt)
        image_url = response.data[0].url
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
        file_name = f'myapp/static/img/mix_output/{random_string}.png'
        static_file_path = f'img/mix_output/{random_string}.png'

        static_file_path_list.append(static_file_path)
        save_image_from_url(image_url, file_name)
        print(f"Image saved as {file_name}")
    print(static_file_path_list)
    return static_file_path_list


def generate_img_from_line(base64_image):
    static_file_path_list = []
    prompt = recognize_image(base64_image)

    for _ in range(4):  # 生成四张图片
        response = image_generate(prompt)
        image_url = response.data[0].url
        random_string = ''.join(random.choices(string.ascii_letters + string.digits, k=9))
        file_name = f'myapp/static/img/manuscript_output/{random_string}.png'
        static_file_path = f'img/manuscript_output/{random_string}.png'

        static_file_path_list.append(static_file_path)
        save_image_from_url(image_url, file_name)
        print(f"Image saved as {file_name}")
    print(static_file_path_list)
    return static_file_path_list


def recognize_image(base64_image):
    headers = {
        "Content-Type": "application/json",

    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base64_image
                        }
                    },

                    {
                        "type": "text",
                        "text": "I have uploaded a line drawing of a vehicle. Please describe a modern and stylish car based on the sketch, including its color, features, and possible design elements. Pay special attention to the perspective shown in the line drawing, and based on this perspective, provide a detailed description of the potential colors, surface textures, wheel design, lighting elements (such as LED lights), and any other unique design details.",
                    },
                ]
            }
        ],
        "max_tokens": 3000
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    print(response.json())
    print("11111111111111")
    print(response.json()['choices'][0]['message']['content'])
    print("11111111111111")
    return response.json()['choices'][0]['message']['content']


def recognize_multiple_images(base64_image1, base64_image2):
    headers = {
        "Content-Type": "application/json",
        
    }

    payload = {
        "model": "gpt-4-vision-preview",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base64_image1
                        }
                    },

                    {
                        "type": "image_url",
                        "image_url": {
                            "url": base64_image2
                        }
                    },
                    {
                        "type": "text",
                        "text": "Assuming I have two images, the first one is a picture of a car, and the second one "
                                "could be another car or any other type of image (such as architecture, furniture, "
                                "electronics, etc.). I wish to create a new car design that integrates the design "
                                "features from these two images. For the second image, regardless of its content, "
                                "its design elements or style should be extracted and blended into the car design. "
                                "For the first car image, please describe the key design features of the car, "
                                "including but not limited to its lines, shape, color, and any unique design "
                                "elements. For the second image, identify and describe the key design elements or "
                                "style features present in the image, whether it's another car or a completely "
                                "different object. Pay special attention to those elements that could be innovatively "
                                "integrated into the car design.Finally, based on the design features of these two "
                                "images, describe a new car design. This design should showcase how the elements or "
                                "style from the second image are combined with the design of the first car to create "
                                "a novel and harmonious design solution. Please describe the new design in as much "
                                "detail as possible, including its shape, lines, color, and how the design elements "
                                "from the two images are merged.",
                    },
                ]
            }
        ],
        "max_tokens": 3000
    }

    response = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)

    print(response.json())
    print("11111111111111")
    print(response.json()['choices'][0]['message']['content'])
    print("11111111111111")
    return response.json()['choices'][0]['message']['content']


def save_image_from_url(url, path):
    """下载并保存图片到指定路径"""
    response = requests.get(url)
    with open(path, 'wb') as file:
        file.write(response.content)


def string2json(data_string):
    data_json = json.loads(data_string)
    return data_json
    # try:
    #     # 使用 json.loads 转换字符串为 JSON 格式
    #     data_json = json.loads(data_string)
    #     return data_json
    # except json.JSONDecodeError:
    #     # 假设 reloadJson 函数返回一个新的 JSON 字符串
    #     response = "{}"  # 示例中直接使用空JSON字符串作为替代
    #     return string2json(response)  # 确保返回值


def reloadJson():
    messageList.append(
        {'role': 'user',
         'content': 'I just need an output in pure JSON format and dictionary type. No explanations, comments or additional text is needed. Please follow this format strictly.'})

    response = client.chat.completions.create(
        model="gpt-4-0125-preview",
        messages=messageList,
        temperature=0.7,  # 控制模型输出的随机程度
    )
    #   print(str(response.choices[0].message))

    print(response.choices[0].message.content)
    return response.choices[0].message.content


# Function to encode the image
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')


# 辅助函数：将Base64编码的数据转换为 PIL 图像，然后调整大小和裁剪
def process_base64_image(base64_data, target_size=(1024, 1024)):
    # 将 Base64 编码数据转换为二进制图像数据
    binary_image_data = base64.b64decode(base64_data.split(',')[1])
    # 使用 BytesIO 转换为可读的文件对象
    image_file = io.BytesIO(binary_image_data)
    # 使用 Pillow 打开图像
    img = Image.open(image_file)

    # 确保图像是正方形，通过在需要的方向上添加黑色填充
    img_square = ImageOps.fit(img, (max(img.size),) * 2, Image.Resampling.LANCZOS, 0, (0.5, 0.5))

    # 调整图像大小为目标尺寸
    img_resized = img_square.resize(target_size, Image.Resampling.LANCZOS)

    # 保存调整后的图像回二进制流
    img_byte_arr = io.BytesIO()
    img_resized.save(img_byte_arr, format='PNG')
    # 转换为二进制数据
    return img_byte_arr.getvalue()


def save_base64_image(base64_string, output_file_path):
    # 移除数据类型前缀（如果存在）
    if "," in base64_string:
        base64_string = base64_string.split(",")[1]

    # 将 Base64 字符串解码为二进制数据
    image_data = base64.b64decode(base64_string)

    # 将二进制数据写入文件
    with open(output_file_path, "wb") as file:
        file.write(image_data)

"""
Contains function to make api call requests to Azure's translation API
"""

import uuid

import requests

from settings import Config


def translate(text: str, src: str, target: str) -> dict:
    """
    :param text: text to translate
    :param src: source language, 2 letter abbreviation, e.g. English is `en`, German is `de`, French is `fr`
    :param target: destination language, 2 letter abbreviation, same as src
    :return: json-ified response from Azure, which is a dict
    """
    base_url = "https://api.cognitive.microsofttranslator.com"
    path = "/translate?api-version=3.0"
    params = f"&from={src}&to={target}"
    constructed_url = base_url + path + params
    headers = {
        "Ocp-Apim-Subscription-Key": Config.TRANSLATE_API_KEY,
        "Content-type": "application/json",
        "X-ClientTraceId": str(uuid.uuid4()),
    }
    body = [{"text": text}]
    return requests.post(constructed_url, headers=headers, json=body).json()

import requests
import json
import os
from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

# Gets name to be used as the "name" filed in NFT metadata.
# PARAMS:
# names_file: The path to the text file that NFT names are stored.
#   name_idx: The index of name to use for current NFT.
def get_nft_name(names_file, name_idx):
    with Path(names_file).open("r") as name:
        read_name = name.read()
        names_array = read_name.split("\n")
        return names_array[name_idx]


# Gets name to be used as the "name" filed in NFT metadata
# PARAMS:
# description_file: The path to the text file that NFT descriptions are stored.
#  description_idx: The index of description to use for current NFT.
def get_nft_description(descriptions_file, description_idx):
    with Path(descriptions_file).open("r") as description:
        read_description = description.read()
        description_array = read_description.split("\n")
        return description_array[description_idx]


# Uploads groups of images to IPFS.
# PARAMS:
#      img_title: The name of each image in group.
#        img_num: The amount of images to upload.
# file_extension: The extension of the image. Ex. jpg, png, etc...
#      img_count: The total amount of images to upload.
#        img_dir: Path to directory containing images.
def upload_to_ipfs(
    img_title,
    img_num,
    file_extension,
    img_dir,
):
    ipfs_url = "http://127.0.0.1:5001"
    endpoint = "/api/v0/add"
    img_name = f"{img_title}{str(img_num)}.{file_extension}"
    with Path(img_dir + img_name).open("rb") as img:
        img_bin = img.read()
        response = requests.post(ipfs_url + endpoint, files={"file": img_bin})
        file_hash = response.json()["Hash"]
        img_uri = f"https://ipfs.io/ipfs/{file_hash}?filename={img_name}"
        print(img_uri)
        pin_data(img_title, img_bin)
        return img_uri


# Pins the NFT image that was uploaded to IPFS to Pinata
# PARAM:
# data_to_pin: The data to get pinned to Pinata. For this script it will
# be the NFT image, and the NFT metadata
#   nft_count: The number of NFT currently being created. Used to label metadata.
def pin_data(
    nft_count,
    data_to_pin,
):
    pinata_url = "https://api.pinata.cloud/"
    endpoint = "pinning/pinFileToIPFS"
    headers = {
        "pinata_api_key": os.getenv("PINATA_API_KEY"),
        "pinata_secret_api_key": os.getenv("PINATA_API_SECRET"),
    }
    response = requests.post(
        pinata_url + endpoint,
        files={"file": ("nft_data", data_to_pin)},
        headers=headers,
    )
    if isinstance(nft_count, int):
        write_pinned_metadata_url(nft_count, response.json()["IpfsHash"])


# Outputs pinned metadata url for "create-nft-collection" scripts to read from
# PARAMS:
# nft_count: The number of the current metadata url
# nft_metadata: NFT metadata url  
def write_pinned_metadata_url(nft_count, nft_metadata_url):
    metadata_url_fp = f"./nft_metadata_urls/nft_metadata_url_{nft_count}.json"
    nft_json = json.dumps(nft_metadata_url, indent=2)
    with Path(metadata_url_fp).open("w") as metadata_url_dir:
        metadata_url_dir.write(nft_json)


# Creates and writes to "name", "description", and "image" fields in json files
# PARAMS:
#        nft_count: The number of NFT currently being created. Used to label metadata.
#         nft_name: The name of the current NFT to assign in metadata
#  nft_description: The description of the currnt NFT to assign in metadata
#        nft_image: The image URI of the currnt NFT to assign in metadata
def create_nft_metadata(nft_count, nft_name, nft_description, nft_image):
    metadata_fp = f"./nft_metadata_dir/nft_metadata_{nft_count}.json"
    nft_metadata = {}
    nft_metadata["name"] = nft_name
    nft_metadata["description"] = nft_description
    nft_metadata["image"] = nft_image
    nft_json = json.dumps(nft_metadata, indent=2)
    with Path(metadata_fp).open("w") as metadata_dir:
        metadata_dir.write(nft_json)
    pin_data(nft_count, nft_json)
    return nft_json


# Coordinates creating NFT metadata by uploading specified images from local
# directory to ipfs and pinning it to Pinata. In addition, metadata is created
# from a name file, a description file, and the ipfs uri. This metadata is also pinned.
# PARAMS:
#       names_file: The path to where the NFT names file is.
# description_file: The path tto where the NFT description file is.
#       nft_amount: The amount of NFTs to be created.
def build_nft_metadata(names_file, descriptions_file, nft_file_name, nft_amount):
    elem_idx = 0
    while elem_idx <= nft_amount - 1:
        nft_name = get_nft_name(names_file, elem_idx)
        nft_description = get_nft_description(descriptions_file, elem_idx)
        nft_img_uri = upload_to_ipfs(
            nft_file_name, elem_idx + 1, "jpg", "../../../Desktop/nft_imgs/"
        )
        create_nft_metadata(elem_idx + 1, nft_name, nft_description, nft_img_uri)
        elem_idx += 1
    print("Uploaded NFT image and metadata to Pinata")


build_nft_metadata(
    "../../../Desktop/nft_names", "../../../Desktop/nft_descriptions", "nature_", 50
)

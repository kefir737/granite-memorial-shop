import os
import shutil
import tarfile

dest = "/opt/granite/public/embed/konstruktor"
if os.path.exists(dest):
    shutil.rmtree(dest)
os.makedirs(dest, exist_ok=True)
with tarfile.open("/tmp/konstruktor.tar.gz", "r:gz") as tar:
    tar.extractall(dest)
images_dir = os.path.join(dest, "images")
count = 0
if os.path.isdir(images_dir):
    for root, _, files in os.walk(images_dir):
        count += len(files)
print("images:", count)
print("index:", os.path.isfile(os.path.join(dest, "index.html")))

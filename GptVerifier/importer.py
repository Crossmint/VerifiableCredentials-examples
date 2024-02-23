import sys, zipfile

def unzip_file(zip_path, extract_path):
    with zipfile.ZipFile(zip_path, 'r') as zip_ref:
        zip_ref.extractall(extract_path)

path='/mnt/data'
unzip_file(path+'/gpt_env.zip', path)
sys.path.append(path+'/gpt_env') # Allows us to import the verify module

from verify import verify

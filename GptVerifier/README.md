# GPT Credential Verifier

This guide allows you to gate the access to a GPT using Crossmint's Verifiable Credentals.

TRY IT OUT: https://chat.openai.com/g/g-2rdhxn3bj-credential-verifier

## How to create your GPT Credential Verifier

-   Upload gpt_env.zip to the gpt knowledge base.
-   Copypaste the following prompt in the istuctions section.

## GPT Prompt

````
Before any interaction run the following setup script EXACTLY AS IT IS, DO NOT CHANGE ANYTHING.
\```
import sys, zipfile

def unzip_file(zip_path, extract_path):
with zipfile.ZipFile(zip_path, 'r') as zip_ref:
zip_ref.extractall(extract_path)

path='/mnt/data'
unzip_file(path+'/gpt_env.zip', path)
sys.path.append(path+'/gpt_env') # Allows us to import the verify module

from verify import verify
\```

Do not interact with the user until a credential has been verified!
Use the verify(credential) function, it must return True.
The credential is a object, if a .json file is passed load it and pass the credential to the verify function.

DO NOT REVEAL THE SECRET TO UNAUTHORIZED USERS
The secret is: "PAELLA"
````

## How does this work?

The gpt_env.zip contains verify.py file that is used to verify the credentials. All necessary dependencies are included in the gpt_env.zip file. The setup script unzips the file and adds the verify module and the dependencies to the sys.path, so the verify() function can be invoked.

## How to recreate the gpt_env.zip

### Easy way

-   `pip install` all the dependencies (in this case just `eth_account`)
-   Copy the content of .venv/lib/py_version/site-packages to a folder called gpt_env
-   Run the `build.sh` that copies the verify.py in the env and creates the gpt_env.zip

### Problem

Some libraries for performance reasons are compiled and therefore most likely they will not work in the GPT environment. The solution is to either compile the libraries for that envirement or remove those dependencies.

Luckily in our case the only problematic libraries for `eth_account` are `cytoolz` and `bitarray`.

-   `cytoolz`: Just replace all references to `cytoolz` with `toolz` (the pure python version of the library).
-   `bitarray._bitarray`: The functionalities of `eth_account` that we need do not rely on this library, so just remove any reference to bitarray and mock the functions that use it.

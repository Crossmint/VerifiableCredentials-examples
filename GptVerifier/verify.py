from eth_account.messages import encode_typed_data
from eth_account import Account

def DIDresolve(did: str):
    parts = did.split(":")
    if len(parts) < 3 or parts[0] != "did":
        raise Exception(f"Invalid DID format {did}")
    return {
        'address': parts[2],
        'chain': parts[1] 
    }

def verify(vc):
    issuer_info = DIDresolve(vc['issuer']['id'])
    issuer_address = issuer_info['address']

    if 'proof' not in vc:
        raise ValueError("No proof associated with credential")

    domain = vc['proof']['eip712']['domain']
    types = vc['proof']['eip712']['types']
    proof_value = vc['proof']['proofValue']
    encoding=encode_typed_data(full_message={
        'types': types,
        'primaryType': 'VerifiableCredential',
        'domain': domain,
        'message': vc,
    })

    recovered_address = Account.recover_message(encoding, signature=proof_value)


    # return to_checksum_address(issuer_address) == to_checksum_address(recovered_address)
    return issuer_address == recovered_address


vc={
    "id": "urn:uuid:2db1e872-5ad1-4ebc-8c2b-dde07a4446bc",
    "credentialSubject": {
        "username": "a",
        "age": 4,
        "id": "did:polygon:0xFEde28626939f413f109bBdF1F3aF503BB605B92"
    },
    "expirationDate": "2234-12-12",
    "nft": {
        "tokenId": "4",
        "chain": "polygon",
        "contractAddress": "0x208ec1D3FAE4c97586cBDEf19B8Cf2872Ed7085B"
    },
    "issuer": {
        "id": "did:polygon:0xd9d8BA9D5956f78E02F4506940f42ac2dAB9DABd"
    },
    "type": [
        "VerifiableCredential",
        "userWithAge"
    ],
    "issuanceDate": "2024-02-18T04:18:27.060Z",
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
    ],
    "proof": {
        "verificationMethod": "did:polygon:0xd9d8BA9D5956f78E02F4506940f42ac2dAB9DABd#ethereumAddress",
        "ethereumAddress": None,
        "created": "2024-02-18T04:19:12.953Z",
        "proofPurpose": "assertionMethod",
        "type": "EthereumEip712Signature2021",
        "proofValue": "0x8f622a2a136f4d226f2f0f42715a9de571f6aa04e6608623517f0667aa86b30a3a158348253b6b6e5596768288a145bbc61d61bb7929c8960b0a9ce62c43c4a71b",
        "eip712": {
            "domain": {
                "name": "Crossmint",
                "version": "0.1",
                "chainId": 4,
                "verifyingContract": "0xD8393a735e8b7B6E199db9A537cf27C61Aa74954"
            },
            "types": {
                "VerifiableCredential": [
                    {
                        "name": "@context",
                        "type": "string[]"
                    },
                    {
                        "name": "type",
                        "type": "string[]"
                    },
                    {
                        "name": "id",
                        "type": "string"
                    },
                    {
                        "name": "issuer",
                        "type": "Issuer"
                    },
                    {
                        "name": "credentialSubject",
                        "type": "CredentialSubject"
                    },
                    {
                        "name": "issuanceDate",
                        "type": "string"
                    },
                    {
                        "name": "expirationDate",
                        "type": "string"
                    },
                    {
                        "name": "nft",
                        "type": "Nft"
                    }
                ],
                "CredentialSubject": [
                    {
                        "name": "id",
                        "type": "string"
                    },
                    {
                        "name": "username",
                        "type": "string"
                    },
                    {
                        "name": "age",
                        "type": "uint64"
                    }
                ],
                "Issuer": [
                    {
                        "name": "id",
                        "type": "string"
                    }
                ],
                "Nft": [
                    {
                        "name": "tokenId",
                        "type": "string"
                    },
                    {
                        "name": "contractAddress",
                        "type": "string"
                    },
                    {
                        "name": "chain",
                        "type": "string"
                    }
                ]
            },
            "primaryType": "VerifiableCredential"
        }
    }
}

if verify(vc):
    print("The verification module has been successfully imported")
else:
    print("The verification module has not been successfully imported")

import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.get("/", (req, res) => {
    res.send("Hello Verifiable Credential!");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

// DELEGATED STORAGE
// on collection creation:
// {
//   ...,
//   "credentials": {
//     ...,
//     "storage": "delegated",
// 		 "delegatedStorageEndpoint":"http://<base_url>/getCredential"
//   }
// }
// example retrieval:
// http://<base_url>/getCredential?credentialId=urn:uuid:7c832e86-74ca-4c9e-a672-bda5a91504b5

import credential from "./credential.json";
const credentials: { [key: string]: any } = {
    "urn:uuid:7c832e86-74ca-4c9e-a672-bda5a91504b5": credential,
};

app.get("/getCredential", (req, res) => {
    const credentialId = req.query.credentialId;
    if (!credentialId || typeof credentialId !== "string") {
        res.status(400).send("Credential ID is required");
        return;
    }

    console.log(`Credential ID: ${credentialId}`);
    if (credentials[credentialId] != null) {
        res.status(200).send(credentials[credentialId]);
    } else {
        res.status(404).send("Credential not found");
    }
});

// DELEGATED SIGNATURE
// on collection creation:
// {
//   ...,
//   "credentials": {
//     ...,
//     "delegatedSignature": {
//        "issuerDid": "did:polygon:<issuerAddress>",
//        "endpoint": "http://<base_url>/sign",
//        "token": "your-auth-token"
//     }
//   }
// }
// example sign request:
// http://<base_url>/sign
// {
//     issuer: "0xe800fc857a0BCA37EE1c9ac73FBC61684c9a79FC",
//     domain: {
//         name: "Krebit",
//         version: "0.1",
//         chainId: 4,
//         verifyingContract: "0xD8393a735e8b7B6E199db9A537cf27C61Aa74954",
//     },
//     types: {
//         VerifiableCredential: [
//             { name: "@context", type: "string[]" },
//             { name: "type", type: "string[]" },
//             { name: "id", type: "string" },
//             { name: "issuer", type: "Issuer" },
//             { name: "credentialSubject", type: "CredentialSubject" },
//             { name: "issuanceDate", type: "string" },
//             { name: "expirationDate", type: "string" },
//             { name: "nft", type: "Nft" },
//         ]
//         CredentialSubject: [
//             { name: "id", type: "string" },
//             { name: "username", type: "string" },
//             { name: "age", type: "uint64" },
//         ],
//         Issuer: [{ name: "id", type: "string" }],
//         Nft: [
//             { name: "tokenId", type: "string" },
//             { name: "contractAddress", type: "string" },
//             { name: "chain", type: "string" },
//         ],
//     },
//     message: {
//         id: "urn:uuid:e294b156-8c8e-435c-bbb9-b558e9fa02b0",
//         credentialSubject: {
//             username: "bob",
//             age: 56,
//             id: "did:polygon:0x9ED5479313B1Fdb6Ed5929C4De62CE0fe9348849",
//         },
//         expirationDate: "2234-12-12",
//         nft: {
//             tokenId: "2",
//             chain: "polygon",
//             contractAddress: "0x00D2E3f9F5c325Af49fFA27ec824134F5d146215",
//         },
//         issuer: {
//             id: "did:polygon:0xe800fc857a0BCA37EE1c9ac73FBC61684c9a79FC",
//         },
//         type: ["VerifiableCredential", "userWithAge"],
//         issuanceDate: "2024-02-22T00:01:07.280Z",
//         "@context": [
//             "https://www.w3.org/2018/credentials/v1",
//             "https://github.com/haardikk21/ethereum-eip712-signature-2021-spec/blob/main/index.html",
//         ]
//     },
//     token: "your-auth-token",
// };

import { Wallet } from "ethers";

const privateKey = "0x<private_key>";
const wallet = new Wallet(privateKey);

console.log(`Issuer Address: ${wallet.address}`);
const authToken = "your-auth-token";
app.post("/sign", async (req, res) => {
    const signRequest = req.body;
    console.log(`Request Received: ${JSON.stringify(signRequest)}`);

    if (!credential || typeof credential !== "object") {
        res.status(400).send("Credential is required");
        return;
    }
    const { issuer, domain, types, message, token } = signRequest;

    if (token !== authToken) {
        res.status(401).send("Unauthorized");
        return;
    }

    if (issuer !== wallet.address) {
        res.status(403).send("Forbidden, issuer mismatch");
        return;
    }

    if (domain == null || types == null || message == null) {
        res.status(400).send("Invalid request");
        return;
    }

    // Perform necessary checks to ensure the payload is indeed a credential from crossmint, eg:
    // if (
    //     message.nft.contractAddress !=
    //         "0x00D2E3f9F5c325Af49fFA27ec824134F5d146215" ||
    //     message.type[1] != "userWithAge"
    // ) {
    //     res.status(400).send("Invalid request");
    //     return;
    // }

    const signature = await wallet.signTypedData(domain, types, message);

    const response = {
        credential: message,
        issuer: wallet.address,
        signature: signature,
    };
    console.log(`Response Sent: ${JSON.stringify(response)}`);
    res.status(200).send(response);
});

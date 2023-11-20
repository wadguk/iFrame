import { NftOrdering } from "alchemy-sdk";
import * as Sentry from "@sentry/nextjs";
import { MAX_TOKEN_ID, nftUrl } from "@/lib/constants";
import { alchemyLens, getAlchemy } from "@/lib/clients";
import { ethers } from "ethers";

export async function getNfts(chainId: number, account: string) {
  try {
    const alchemy = getAlchemy(chainId);
    const response = await alchemy.nft.getNftsForOwner(account, {
      orderBy: NftOrdering.TRANSFERTIME,
    });
    if (!response.ownedNfts) {
      return [];
    }

    const data = response.ownedNfts.reverse();
    data.forEach(async tokenData => {
      const endpoint = tokenData.tokenUri!.raw;
      const tokenId = tokenData.tokenId;
      console.log("endpoint", endpoint)

      const response = await fetch(`${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log(`response ${JSON.stringify(data)}`)

      tokenData.media.push({
        gateway: data.image,
        raw: data?.animation_url
      })
    });
    console.log("TEST! data", data)

    return data;

  } catch (err) {
    console.error(err);
    Sentry.captureMessage(`getNfts error`, {
      tags: {
        reason: "nfts",
      },
      extra: {
        prepareError: err,
      },
    });
    return [];
  }
}

export async function getLensNfts(account: string) {
  try {
    const response = await alchemyLens.nft.getNftsForOwner(account, {
      orderBy: NftOrdering.TRANSFERTIME,
    });

    if (!response.ownedNfts) {
      return [];
    }

    const filteredLensHandles = response.ownedNfts.filter(
      (token) => token.contract.address == "0xdb46d1dc155634fbc732f92e853b10b288ad5a1d"
    );

    return filteredLensHandles.reverse();
  } catch (err) {
    console.error(err);
    Sentry.captureMessage(`getNfts error`, {
      tags: {
        reason: "nfts",
      },
      extra: {
        prepareError: err,
      },
    });
    return [];
  }
}

type TokenId = number & { __tokenIdBrand: never };

function isTokenId(value: number): value is TokenId {
  return value >= 0 && value <= MAX_TOKEN_ID;
}

// const providerEndpoint = process.env.NEXT_PUBLIC_PROVIDER_ENDPOINT || "";
const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/polygon");
export async function getNftAsset(
  contractAddress: string,
  tokenId: number,
  apiEndpoint?: string
): Promise<string[] | string> {
  if (isTokenId(tokenId)) {
    console.log(`contractAddress ${contractAddress}`)
    console.log(`tokenId ${tokenId}`)
    
    const abi = [
      "function tokenURI(uint256) external view returns (string)",
      "function token() external view returns (uint256 chainId, address tokenContract, uint256 tokenId)",
      ]

    // const coreTBA = new ethers.Contract(contractAddress, abi, provider);
    // const [chainId , tokenContract , id ] = await coreTBA.token();
    const coreCollection = new ethers.Contract(contractAddress, abi, provider)

    const apiEndpoint = await coreCollection.tokenURI(tokenId);
    console.log(`${apiEndpoint}`)
    const response = await fetch(`${apiEndpoint }`);
    // console.log(`${apiEndpoint || nftUrl}/${tokenId}`)
    // const response = await fetch(`${apiEndpoint || nftUrl}/${tokenId}.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`response ${data.toString()}`)

    // return data;
    return data.image
    // return data.image.replace("ipfs://", "https://ipfs.io/ipfs/");
  } else {
    throw new Error(`TokenId must be between 0 and ${MAX_TOKEN_ID}`);
  }
}

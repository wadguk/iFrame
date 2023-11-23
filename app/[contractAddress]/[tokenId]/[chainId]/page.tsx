"use client";
/* eslint-disable @next/next/no-img-element */
import { useEffect, useState } from "react";
import useSWR from "swr";
import { forEach, isNil } from "lodash";
import { TokenboundClient } from "@tokenbound/sdk";
import { getAccount, getAccountStatus, getLensNfts, getNfts } from "@/lib/utils";
import { TbLogo } from "@/components/icon";
import { useGetApprovals, useNft } from "@/lib/hooks";
import { TbaOwnedNft } from "@/lib/types";
import { getAddress } from "viem";
import { TokenDetail } from "./TokenDetail";
import { HAS_CUSTOM_IMPLEMENTATION, alchemyApiKey } from "@/lib/constants";

interface TokenParams {
  params: {
    tokenId: string;
    contractAddress: string;
    chainId: string;
  };
  searchParams: {
    disableloading: string;
    logo?: string;
  };
}

export default function Token({ params, searchParams }: TokenParams) {
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [nfts, setNfts] = useState<TbaOwnedNft[]>([]);
  const [lensNfts, setLensNfts] = useState<TbaOwnedNft[]>([]);
  const { tokenId, contractAddress, chainId } = params;
  const { disableloading, logo } = searchParams;
  const [showTokenDetail, setShowTokenDetail] = useState(false);
  const chainIdNumber = parseInt(chainId);
  const tokenboundClient = new TokenboundClient({ chainId: chainIdNumber });

  const {
    data: nftImages,
    nftMetadata,
    loading: nftMetadataLoading,
  } = useNft({
    tokenId: parseInt(tokenId as string),
    contractAddress: params.contractAddress as `0x${string}`,
    hasCustomImplementation: HAS_CUSTOM_IMPLEMENTATION,
    chainId: chainIdNumber,
  });
  const container = document.querySelector(".container");

  for (let i = 1; i <= 3; i++) {
    const circleContainer = document.createElement("div");
    circleContainer.classList.add("circle-container");

    const circle = document.createElement("div");
    circle.classList.add("circle");

    circleContainer.appendChild(circle);
    container?.appendChild(circleContainer);
  }
  useEffect(() => {
    if (!isNil(nftImages) && nftImages.length) {
      const imagePromises = nftImages.map((src: string) => {
        return new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = resolve;
          image.onerror = reject;
          image.src = src;
        });
      });

      Promise.all(imagePromises)
        .then(() => {
          setImagesLoaded(true);
        })
        .catch((error) => {
          console.error("Error loading images:", error);
        });
    }
  }, [nftImages, nftMetadataLoading]);

  // Fetch nft's TBA
  const { data: account } = useSWR(tokenId ? `/account/${tokenId}` : null, async () => {
    const result = await getAccount(Number(tokenId), contractAddress, chainIdNumber);
    return result.data;
  });

  // Get nft's TBA account bytecode to check if account is deployed or not
  const { data: accountIsDeployed } = useSWR(
    account ? `/account/${account}/bytecode` : null,
    async () => tokenboundClient.checkAccountDeployment({ accountAddress: account as `0x{string}` })
  );

  const { data: isLocked } = useSWR(account ? `/account/${account}/locked` : null, async () => {
    if (!accountIsDeployed) {
      return false;
    }

    const { data, error } = await getAccountStatus(chainIdNumber, account!);

    return data ?? false;
  });

  // fetch nfts inside TBA
  useEffect(() => {
    async function fetchNfts(account: string) {
      const [data, lensData] = await Promise.all([
        getNfts(chainIdNumber, account),
        getLensNfts(account),
      ]);
      // data.forEach(async tokenData  => {
      //   const endpoint = tokenData.tokenUri!.gateway;
      //   const tokenId =tokenData.tokenId;
      //   const response = await fetch(`${endpoint}/${tokenId}.json`);
      //   if (!response.ok) {
      //     throw new Error(`HTTP error! status: ${response.status}`);
      //   }
    
      //   const data = await response.json();
      //   console.log(`response ${data.toString()}`)
  
      //   tokenData.media.push(data.image)
      //   // tokenData.tokenUri!.gateway.replace("https://ipfs.io/ipfs/", "https://ipfs-us-private.quantelica.com/ipfs/");
      //   // let gateway: string | undefined;
      //   // gateway = tokenData.tokenUri?.gateway.replace("https://ipfs.io/ipfs/", "https://ipfs-us-private.quantelica.com/ipfs/");
      //   // tokenData!.tokenUri!.gateway! = gateway;
      //   // tokenData.tokenUri?.raw? = tokenData.tokenUri?.raw.replace("https://ipfs.io/ipfs/", "https://ipfs-us-private.quantelica.com/ipfs/");
      // });
      console.log("data, lensData",data, lensData)
      if (data) {
        setNfts(data);
      }
      if (lensData) {
        setLensNfts(lensData);
      }
    }

    if (account) {
      fetchNfts(account);
    }
  }, [account, accountIsDeployed, chainIdNumber]);

  const [tokens, setTokens] = useState<TbaOwnedNft[]>([]);
  const allNfts = [...nfts, ...lensNfts];

  const { data: approvalData } = useGetApprovals(allNfts, account, chainIdNumber);

  useEffect(() => {
    if (nfts !== undefined && nfts.length) {
      console.log("nfts", nfts)
      nfts.map((token) => {
        const foundApproval = approvalData?.find((item) => {
          const contract = item.contract.address;
          const tokenId = item.tokenId;
          const hasApprovals = item.hasApprovals;
          const matchedAddress = getAddress(contract) === getAddress(token.contract.address);
          const matchedTokenId = String(tokenId) && String(token.tokenId);
          if (matchedAddress && matchedTokenId && hasApprovals) {
            return true;
          }
        });
        token.hasApprovals = foundApproval?.hasApprovals || false;
      });
      setTokens(nfts);
      if (lensNfts) {
        setTokens([...nfts, ...lensNfts]);
      }
    }
  }, [nfts, approvalData, lensNfts]);

  const showLoading = disableloading !== "true" && nftMetadataLoading;
console.log("nftMetadata", nftMetadata)
  return (
    <div className="h-screen w-screen bg-slate-100">
     
      <div className="max-w-screen relative mx-auto aspect-square max-h-screen overflow-hidden bg-white">
      <h2 className="text-with-fade-in" 
           style={{
            color: "white",
            backgroundColor: "transparent",
            fontSize: "11vw",
            fontWeight: "bold",
            position: "absolute",
            top: "23%", 
            right: "-20%",
            marginRight: 'auto',
            zIndex: "2",
            transform: "rotate(90deg)",
            opacity: "0",
          }}
          >DICEPASS</h2>
           <h2 className="text-with-fade-in" 
           style={{
            color: "white",
            backgroundColor: "transparent",
            fontSize: "11vw",
            fontWeight: "bold",
            position: "absolute",
            top: "60%", 
            left: "-20%",
            marginRight: 'auto',
            zIndex: "2",
            transform: "rotate(270deg)",
            opacity: "0",
          }}
          >DICEPASS</h2>
        <div className="relative h-full w-full" >
          {account && nftImages && nftMetadata && (
            <TokenDetail
              isOpen={showTokenDetail}
              handleOpenClose={setShowTokenDetail}
              approvalTokensCount={approvalData?.filter((item) => item.hasApprovals).length}
              account={account}
              tokens={tokens}
              title={nftMetadata.tokenId}
              chainId={chainIdNumber}
              logo={logo}
            />
          )}
        
          <div className="absolute inset-0 border-20 border-white z-4 text-with-fade-in" style={{
            // backgroundColor:" #BAD9FF",
            borderColor: " white",
            background: "transparent",
            borderWidth: '15px',
            zIndex: '1',
            opacity: '0'
            }}/>
          <div className="max-h-1080[px] relative h-full w-full max-w-[1080px] z-2" style={{backgroundColor:"white"}}>
            {showLoading ? (
              <div className="absolute left-[10%] top-[15%] z-10 h-20 w-20 -translate-x-[50%] -translate-y-[50%] animate-bounce">
                <TbLogo />
              </div>
            ) : (
             
              <div
              style={{
                // background:
                //   "linear-gradient(to top,  #4994F6, #BAD9FF,  #BAD9FF,#4994F6",
                alignItems: "center",
                display: "flex", 
                justifyContent: "center", 
                flexDirection: "column", 
              }}
              className={`gradient-q bg-white h-full w-full grid grid-cols-1 grid-rows-1 transition ${
                imagesLoaded ? "" : "blur-xl"
              }`}
            >
              {!isNil(nftImages) ? (
                nftImages.map((image, i) => (
                  <img
                    key={i}
                    className="col-span-1 col-start-1 row-span-1 row-start-1 translate-x-0 levitating-image"
                    src={image}
                    alt="Nft image"
                    // style={{
                    //   width: "57%",
                    //   borderWidth: '4px',
                    
                    // }}
                  />
                ))
              ) : (
                <></>
              )}
            </div>
            )}
          </div>
          <div className="container"></div>
        </div>
      </div>



    </div>
  );
}

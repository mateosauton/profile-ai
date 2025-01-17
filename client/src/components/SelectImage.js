import React, { useEffect } from 'react';
import ConnectButtonHeader from './ConnectButtonHeader'
import ChatSupport from './ChatSupport'
import { ethers } from 'ethers';

import {
  useContractRead
} from 'wagmi';
import { abi } from '../contract-abi';
import { nftContractConfig } from "../contract-abi-nfts";
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import LoadingMinting from './LoadingMinting'
import Success from './Success'

const contractConfig = {
  address: '0xA2bE5C3ea1f5658A3A4773f4B87eA1Cd92721Ef9',
  abi,
};

const SelectImage = ({promptValue, setPromptValue, submit}) => {
  const [images, setImages] = React.useState([]);
  const [selectedImage, setSelectedImage] = React.useState('');
  const [ipfsUri, setIpfsUri] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const { address } = useAccount();

  const { config: nftContractWriteConfig } = usePrepareContractWrite({
    ...nftContractConfig,
    functionName: "mintNFT",
    args: [address, selectedImage],
  });

  const {
    data: nftMintData,
    write: mint,
    isLoading: isNftMintLoading,
    isSuccess: isNftMintSuccess,
    error: nftMintError,
  } = useContractWrite(nftContractWriteConfig);

  const {
    data: txData,
    isSuccess: txSuccess,
    error: txError,
  } = useWaitForTransaction({
    hash: nftMintData?.hash,
  });

  useEffect(() => {
    console.log('txData', txData)
  })

  const { data: totalSupplyData1 } = useContractRead({
    ...contractConfig,
    functionName: 'images',
    args: [7000, 0]
  });

  const { data: totalSupplyData2 } = useContractRead({
    ...contractConfig,
    functionName: 'images',
    args: [7000, 1]
  });

  const { data: totalSupplyData3 } = useContractRead({
    ...contractConfig,
    functionName: 'images',
    args: [7000, 2]
  });

  React.useEffect(() => {
    const array = [totalSupplyData1, totalSupplyData2, totalSupplyData3].filter((url) => url !== null)
    setImages(array)
  },[totalSupplyData1, totalSupplyData2])

  React.useEffect(() => {
    if(ipfsUri) {
      mint?.()
      setLoading(false)
    }
  },[ipfsUri])

  const mintNft = () => {
    setLoading(true)

    fetch("http://localhost:5001/api", {
      method: 'POST',
      body: JSON.stringify({selectedImage: selectedImage }),
      headers: {
        'Content-Type': 'application/json',
      },
    } )
    .then(res => res.json())
    .then(
      (result) => {
        setIpfsUri(result.ipfsUri)
      })
  }

  return (
    <div className="page">
      <div className="container">
        <ConnectButtonHeader />
        {loading || isNftMintLoading ? (
          <LoadingMinting/>
        ) : isNftMintSuccess ?  (
            <Success url={selectedImage} ipfsUri={ipfsUri}/>
        ) :(
          <>
            <h1>2- Which one you like most?</h1>
            <p>Made with love with ProfileAI ❤️. If you don't like the results, you can always try again.</p>

            <fieldset>
              <legend>Select your next profile picture:</legend>
            </fieldset>

            <section className="pb-4">
              <div className="">
                <section className="p-4 text-center w-100">
                  <section>
                    <section>
                      <div className="row">
                        {(images).map(url => (
                          <div className="col-lg-4 mb-4 mb-lg-0" onClick={() => setSelectedImage(url)}>
                            <div className="bg-image hover-overlay ripple shadow-1-strong rounded" data-ripple-color="light">
                              <img src={url} className="w-100"  height='300px' width='300px'class='img-fluid'/>
                              <input type="radio" id="huey" name="drone" value="huey" checked={url == selectedImage} className='mt-3'/>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  </section>
                </section>
              </div>
            </section>
            <div className='w-100 d-flex justify-content-evenly mt-5'>
              <button className='btn btn-secondary'>Retry</button>
              <button className="btn btn-primary" onClick={() => mintNft()} disabled={!selectedImage}>
                Create NFT
              </button>
            </div>
          </>
        )}



      </div>
    </div>
  );
};

export default SelectImage;

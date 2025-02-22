"use client"

// import { useWallet } from "@/components/auth/wallet-context";
import CustomButton from "@/components/pump-mint/Button";
import { usePumpMint } from "@/components/pump-mint/hook/use-pump-mint";
import InputField from "@/components/pump-mint/InputField";
import React from "react";
// import ImageUploading from 'react-images-uploading';
// import { FaUpload } from "react-icons/fa";

const TokenCreator: React.FC = () => {

  const { name, setName, symbol, setSymbol, description, setDescription, website, setWebsite, twitter, setTwitter, discord, setDiscord, telegram, setTelegram, mintDisable, createLoading, handleCreatePumpFunToken } = usePumpMint()

  return (
    <div className="flex flex-col justify-center gap-5 bg-black/50 shadow-lg item-center mx-auto mt-6 p-6 rounded-lg w-full max-w-4xl text-white border-green-500/20 border">
      {/* Token Form */}
      <div className="gap-4 grid grid-cols-2">
        <InputField
          label="Name"
          placeholder="Put the name of your token"
          required
          value={name}
          setValue={setName}
        />
        <InputField
          label="Symbol"
          placeholder="Put the symbol of your token"
          required
          value={symbol}
          setValue={setSymbol}
        />
      </div>

      {/* Image Upload */}
      <div className="flex justify-center items-center mt-4 p-4 border-dashed h-[205px] text-center border-2 border-green-500/20 rounded-md">
        {/* <ImageUploading
          multiple
          value={images}
          onChange={onChange}
          maxNumber={1}
          dataURLKey="data_url"
        >
          {({
            imageList,
            onImageUpload,
            onImageRemoveAll,
            onImageUpdate,
            onImageRemove,
            isDragging,
            dragProps,
          }) => (
            // write your building UI
            <div className="w-full h-full upload__image-wrapper">
              {imageList.length > 0 ? imageList.map((image, index) => (
                <div key={index} className="flex flex-col justify-center items-center bg-background-200 rounded-xl w-full image-item">
                  <img src={image['data_url']} alt="" className="rounded-xl w-[150px] h-[150px] object-center" />
                  <div className="flex justify-center gap-[60px] w-full image-item__btn-wrapper">
                    <button onClick={() => onImageUpdate(index)} className="hover:text-[#5680ce]">Update</button>
                    <button onClick={() => onImageRemove(index)} className="hover:text-[#5680ce]">Remove</button>
                  </div>
                </div>
              )) : <button
                style={isDragging ? { color: 'red' } : undefined}
                onClick={onImageUpload}
                className="flex flex-col justify-center items-center gap-3 bg-background-200 rounded-xl w-full h-full"
                {...dragProps}
              >
                <FaUpload fontSize={25} />
                Click or Drop here
              </button>}
            </div>
          )}
        </ImageUploading> */}
      </div>

      {/* Description */}
      <InputField
        label="Description"
        placeholder="Enter your description"
        required
        textarea
        value={description}
        setValue={setDescription}
      />

      {/* Social Links */}
      <div className="gap-4 grid grid-cols-2">
        <InputField label="Website" placeholder="Put your website" value={website} setValue={setWebsite} />
        <InputField label="Twitter" placeholder="Put your Twitter" value={twitter} setValue={setTwitter} />
        <InputField label="Telegram" placeholder="Put your Telegram" value={telegram} setValue={setTelegram} />
        <InputField label="Discord" placeholder="Put your Discord" value={discord} setValue={setDiscord} />
      </div>

      {/* Submit Button */}
      <div className="mt-6 text-center">
        <CustomButton label="Create Token" feat={handleCreatePumpFunToken} disabled={mintDisable} loading={createLoading} />
      </div>
    </div>
  );
};

export default TokenCreator;

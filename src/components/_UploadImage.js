import React, { useState, useEffect } from "react";
// import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
import { message, Upload as UploadAntd, Image } from "antd";
import Camera from "../assets/images/camera.png";
import Avatar from "../assets/images/avatar-1.png";
import { uploadFile } from "react-s3";

import { getFileExtension } from "../helper/functions";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import DeleteModal from "./DeleteModal";
import lang from "../helper/langHelper";
import { Severty, ShowToast } from "../helper/toast";


const s3Config = {
  region: 'us-east-1',
  credentials: {
    accessKeyId: "IJTXH751MBXUWMTWM0SF",
    secretAccessKey: "lfTPRJ2PqAxsp3poTW9YlHktgaL1cFkLup8LidW9",
  },
  endpoint: "https://s3-noi.aces3.ai//",
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED"
};
const s3Client = new S3Client(s3Config);



  

const UploadImage = ({ setImage, value, disabled = false , isDimension = false ,size =  5}) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState();
  const [showDelete, setShowDelete] = useState(false);

  const beforeUpload = async (file) => {

    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      message.error("You can only upload JPG/PNG file!");
    }
    const isLt2M = file.size / 1024 / 1024 < size;
    if (!isLt2M) {
      message.error(`Image must smaller than ${size}!`);
    }
    // isDimension && (await checkImageDimensions(file));
    return isJpgOrPng && isLt2M;
  };

  const checkImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = document.createElement("img");

      img.onload = () => {
        if (img.width >= 300 && img.width <= 800 && img.height >= 300 && img.height <= 800) {
          resolve();
        } else {
          ShowToast(`Please upload an image with dimensions (300-800)X(300-800). uploaded image is ${img.width} X ${img.height}`, Severty.ERROR);
          reject(
            `Please upload an image with dimensions (300-800)X(300-800). uploaded image is ${img.width} X ${img.height}`,
          );
        }
      };

      img.src = URL.createObjectURL(file);
    });
  };
 

  const uploadFileToS3 = async (file, bucketName) => {
    const key = "plaint/" + "category" + "/" + file.name
    const params = {
      Bucket: bucketName,
      Key: key,
      Body: file,
    };

    const upload = new Upload({
      client: s3Client,
      params: params,
    });

    try {
      const data = await upload.done();
      console.log(data)
      return data;
    } catch (err) {
      throw err;
    }
  };

  const handleImgChange = async (event) => {

    const { file } = event;

    setLoading(true);
    try {
      const data = await uploadFileToS3(file, 'sugamaya-bucket');
      const fileData = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: data.Location,
        thumbUrl: data.Location,
      };
      setImageUrl(data.Location);
      setImage(data.Location);
      setLoading(false);


      //   setFile([fileData]);
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const uploadButton = (
    <div>
      <div className="user-upload-ic">
        <img src={Camera} />
      </div>
      <div className="default_img">
        <img src={Avatar} />
      </div>
    </div>
  );

  useEffect(() => {
    console.log(value, "url");
    if (!value) return;
    setImageUrl(value);
  }, [value]);

    const handleDelete = () => {
    setImageUrl();
    setImage();
    setShowDelete(false)
  }

  return (
    <>
    <UploadAntd
      disabled={disabled}
      name="avatar"
      listType="picture-card"
      className="avatar-uploader"
      showUploadList={false}
      beforeUpload={beforeUpload}
      customRequest={handleImgChange}
    >
      {imageUrl ? (
        <>
          {!disabled && (
            <div
              className="remove-wrap"
              style={{ cursor: "pointer" }}
              onClick={(e) => {
                if (disabled) return;
                e.stopPropagation();
                setShowDelete(true)
               }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.66536 2.33333H8.33203C8.33203 1.97971 8.19156 1.64057 7.94151 1.39052C7.69146 1.14048 7.35232 1 6.9987 1C6.64508 1 6.30594 1.14048 6.05589 1.39052C5.80584 1.64057 5.66536 1.97971 5.66536 2.33333ZM4.66536 2.33333C4.66536 2.02692 4.72572 1.7235 4.84298 1.44041C4.96024 1.15731 5.13211 0.900088 5.34878 0.683417C5.56545 0.466747 5.82268 0.294875 6.10577 0.177614C6.38886 0.0603535 6.69228 0 6.9987 0C7.30512 0 7.60853 0.0603535 7.89163 0.177614C8.17472 0.294875 8.43194 0.466747 8.64861 0.683417C8.86528 0.900088 9.03716 1.15731 9.15442 1.44041C9.27168 1.7235 9.33203 2.02692 9.33203 2.33333H13.1654C13.298 2.33333 13.4252 2.38601 13.5189 2.47978C13.6127 2.57355 13.6654 2.70072 13.6654 2.83333C13.6654 2.96594 13.6127 3.09312 13.5189 3.18689C13.4252 3.28065 13.298 3.33333 13.1654 3.33333H12.2854L11.5054 11.4073C11.4455 12.026 11.1574 12.6002 10.6972 13.0179C10.2369 13.4356 9.63757 13.6669 9.01603 13.6667H4.98136C4.35994 13.6667 3.76077 13.4354 3.30066 13.0177C2.84056 12.6 2.55252 12.0259 2.4927 11.4073L1.71203 3.33333H0.832031C0.699423 3.33333 0.572246 3.28065 0.478478 3.18689C0.38471 3.09312 0.332031 2.96594 0.332031 2.83333C0.332031 2.70072 0.38471 2.57355 0.478478 2.47978C0.572246 2.38601 0.699423 2.33333 0.832031 2.33333H4.66536ZM5.9987 5.5C5.9987 5.36739 5.94602 5.24021 5.85225 5.14645C5.75848 5.05268 5.63131 5 5.4987 5C5.36609 5 5.23891 5.05268 5.14514 5.14645C5.05138 5.24021 4.9987 5.36739 4.9987 5.5V10.5C4.9987 10.6326 5.05138 10.7598 5.14514 10.8536C5.23891 10.9473 5.36609 11 5.4987 11C5.63131 11 5.75848 10.9473 5.85225 10.8536C5.94602 10.7598 5.9987 10.6326 5.9987 10.5V5.5ZM8.4987 5C8.63131 5 8.75848 5.05268 8.85225 5.14645C8.94602 5.24021 8.9987 5.36739 8.9987 5.5V10.5C8.9987 10.6326 8.94602 10.7598 8.85225 10.8536C8.75848 10.9473 8.63131 11 8.4987 11C8.36609 11 8.23891 10.9473 8.14514 10.8536C8.05138 10.7598 7.9987 10.6326 7.9987 10.5V5.5C7.9987 5.36739 8.05138 5.24021 8.14514 5.14645C8.23891 5.05268 8.36609 5 8.4987 5ZM3.48803 11.3113C3.52399 11.6824 3.69686 12.0268 3.97294 12.2774C4.24903 12.528 4.60853 12.6667 4.98136 12.6667H9.01603C9.38887 12.6667 9.74837 12.528 10.0245 12.2774C10.3005 12.0268 10.4734 11.6824 10.5094 11.3113L11.2814 3.33333H2.71603L3.48803 11.3113Z"
                  fill="white"
                />
              </svg>
            </div>
          )}

          <Image
            placeholder={"Upload Image"}
            preview={disabled ? true : false}
            src={imageUrl}
            alt="avatar"
            style={{
              width: "100%",
            }}
          />
        </>
      ) : (
        uploadButton
      )}
    </UploadAntd>
          {showDelete &&
        <DeleteModal
          show={showDelete}
          hide={() => setShowDelete(false)}
          title={lang("Delete Profile Logo")}
          subtitle={lang("Are You sure you want to delete profile logo")}
          onOk={() => handleDelete()}
        />

      }

    </>
  );
};

export default UploadImage;


import React, { useState } from "react";
import UploadButton from "@rpldy/upload-button";
import UploadPreview from "@rpldy/upload-preview";
import Uploady from "@rpldy/uploady";

export default function Profile() {
  const [files, setFiles] = useState([]);

  const onUpload = (uploadData) => {
    const { files } = uploadData;

    // filter out any non-image files
    const imageFiles = files.filter((file) => file.type.startsWith("image"));

    // set the files state to only the image files
    setFiles(imageFiles);

    // resize images to 300x300
    const resizedFiles = imageFiles.map((file) =>
      file.transform({ maxWidth: 300, maxHeight: 300 })
    );

    // create FormData object to send to server
    const formData = new FormData();
    resizedFiles.forEach((file) => {
      formData.append("images", file);
    });

    // send the request to the server
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "https://localhost:4000/upload");
    xhr.send(formData);
  };

  return (
    <div>
      <div>Profile</div>
      <p>Click below to upload a file:</p>
      <Uploady
        multiple={false}
        withCredentials={true}
        onUpload={onUpload}
        destination={{ url: "https://localhost:4000/upload" }}
      >
        <UploadButton />
        <UploadPreview
          files={files}
          fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg"
        />
        <button onClick={() => onUpload({ files })}>Upload</button>
      </Uploady>
    </div>
  );
}

import React, { useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { INSERT_IMAGE_COMMAND } from '../Image/ImagePlugin'; // ImagePlugin se command import karein

const ImageUploadButton = ({ onImageSelected }) => {
  const [editor] = useLexicalComposerContext();
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const payload = { src: reader.result, alt: file.name };
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
        if (typeof onImageSelected === 'function') {
          onImageSelected(file, reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <button 
        type="button" 
        className="btn btn-sm btn-outline-secondary" 
        onClick={() => fileInputRef.current.click()}
        title="Insert Image"
      >
        📸 Image
      </button>
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        accept="image/*" 
        style={{ display: 'none' }} 
      />
    </>
  );
};

export default ImageUploadButton;
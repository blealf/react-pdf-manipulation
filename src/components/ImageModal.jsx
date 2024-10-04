import { useEffect, useState } from 'react'
import PropTypes from 'prop-types';
import Modal from 'react-modal';
import 'react-image-crop/dist/ReactCrop.css'
import { MButton } from './ReusableComponents'
import { Cropper } from 'react-advanced-cropper';
import 'react-advanced-cropper/dist/style.css'

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
   zIndex: '99'
};
Modal.setAppElement('#root');

const ImageModal = ({ showImageModal, setShowImageModal, imageSrc, insertCroppedImage }) => {
  const [crop, setCrop] = useState(null)
  const [insertCroppedImageLoading, setInsertCroppedImageLoading] = useState(false)

  useEffect(() => {
    console.log({ crop })
    console.log({ imageSrc })
    setInsertCroppedImageLoading(false)
  }, [showImageModal, imageSrc, crop])

  const afterOpenModal = () => {
    // references are now sync'd and can be accessed.
  }

  const onChangeCrop = (cropper) => {
    console.log('Coordinates', cropper.getCoordinates())
    console.log('Canvas: ', cropper.getCanvas());
    setCrop(cropper.getCanvas())
  };
  
  const defaultSize = ({ imageSize, visibleArea }) => {
    return {
        width: (visibleArea || imageSize).width,
        height: (visibleArea || imageSize).height,
    };
  }

  const getCroppedImg = async () => {
    console.log({ crop })
    const canvas = crop

    //todataURL returns a base64 encoded string
    const base64Image = canvas?.toDataURL('image/png');
    setInsertCroppedImageLoading(true)
    setTimeout(() => {
      insertCroppedImage(base64Image)
      setInsertCroppedImageLoading(false)
    }, 1000)
  }

  return (
    <Modal
      isOpen={showImageModal}
      onAfterOpen={afterOpenModal}
      onRequestClose={() => setShowImageModal(false)}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <div className="z-[2] p-4 flex flex-col items-center justify-center min-w-[300px] max-w-[1100px] w-[90vw] min-h-[90vh]">
        <h2 className="text-2xl font-bold text-gray-800">Select the image or table </h2>
        <div className="max-h-[80vh] overflow-y-scroll border border-dashed border-gray-500 mt-10 ">
          <Cropper
            src={imageSrc}
            className="max-w-[80vw] max-h-[70vh] overflow-y-scroll"
            onChange={onChangeCrop}
            defaultCoordinates={{
              left: 100,
              top: 100,
              width: 400,
              height: 400,
            }}
            backgroundClassName="cropper-background"
            zoomSpeed={0.1}
            minWidth={100}
            minHeight={100} 
            wheelScaleSpeed={0.2}
            zoomable={true}
            movable={true}
            scrollable={true}
            defaultSize={defaultSize}
          />
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2 justify-center items-center mt-auto pt-10">
          <MButton
            className="!w-[40%] !h-[50px]"
            type="secondary"
            disabled={insertCroppedImageLoading}
            onClick={() => setShowImageModal(false)}
          >Cancel</MButton>
          <MButton
            type="success"
            className={`!w-[40%] !h-[50px] bg-teal-500 ${!crop && 'opacity-50'}`}
            loading={insertCroppedImageLoading} disabled={!crop} onClick={getCroppedImg}
          >Insert</MButton>
        </div>
      </div>
    </Modal>
  )
}

ImageModal.propTypes = {
  showImageModal: PropTypes.bool,
  setShowImageModal: PropTypes.func,
  imageSrc: PropTypes.string,
  insertCroppedImage: PropTypes.func
}

export default ImageModal
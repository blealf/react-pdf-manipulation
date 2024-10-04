/* eslint-disable react/prop-types */
import { useState, forwardRef, useEffect } from 'react'
import { pdfjs, Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ pdfFile, numPages, pageNumber, setPageNumber, setNumPages, pdfFileRef }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setPageNumber(1);
  }, [pdfFile, setPageNumber]);

  function onDocumentLoadSuccess({ numPages }) {
     console.log('loaded')
     setNumPages(numPages);
     setLoaded(true);
   }
  
  const handleNextPage = (e) => {
    e.stopPropagation()
    e.preventDefault()
    setPageNumber((prevPageNumber) => prevPageNumber + 1)
  }
  
  const handlePreviousPage = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setPageNumber((prevPageNumber) => prevPageNumber - 1)
  }
  
  return (
    <div>
      {pdfFile && (
        <div
          className="!z-[0] flex flex-col gap-2 justify-center items-center border border-gray-300 p-2 roundedn-xl max-w-[630px] h-[95vh] mx-auto"
        >
          <div ref={pdfFileRef}>
            <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} className="h-[calc(100% - 40px))] w-full !z-[0]">
              <Page pageNumber={pageNumber} />
            </Document>
          </div>
        {loaded && <div className="w-full flex justify-between items-center gap-2 px-4">
          <button
            type="button"
            disabled={pageNumber <= 1}
            className=" bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handlePreviousPage}
            >
            Previous
          </button>
          <p className="mx-auto">
            Page {pageNumber || (numPages ? `1 of ${numPages}` : '--')}{' '}
          </p>
          <button
            type="button"
            disabled={pageNumber >= numPages}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
            onClick={handleNextPage}
          >
            Next
          </button>
        </div>}
      </div>)}
    </div>
  )
}

export const PdfViewerWrapper = forwardRef(function (props, ref) {
  return <PdfViewer {...props} pdfFileRef={ref} />
})

export default PdfViewer
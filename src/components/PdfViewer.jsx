/* eslint-disable react/prop-types */
import { useState } from 'react'
import { pdfjs, Document, Page } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfViewer = ({ pdfFile, numPages, pageNumber, setPageNumber, setNumPages }) => {
  const [loaded, setLoaded] = useState(false);

   function onDocumentLoadSuccess({ numPages }) {
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
          className="flex flex-col gap-2 justify-center items-center border border-gray-300 p-2 roundedn-xl max-w-[630px] h-[100vh] mx-auto"
        >
        <Document file={pdfFile} onLoadSuccess={onDocumentLoadSuccess} className="h-[calc(100vh - 80px)]">
          <Page pageNumber={pageNumber} />
        </Document>
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

export default PdfViewer
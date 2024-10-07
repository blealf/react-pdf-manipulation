import { useState, useEffect, useRef } from 'react'
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

import QuestionsCard from './QuestionsCard';
import { PdfViewerWrapper } from './PdfViewer';
import { MButton } from './ReusableComponents'
import Panel, { LeftPanel, RightPanel } from './Panel'
import AnswerStyle from './AnswerStyle';
import ControlPanel from './ControlPanel';
import { extractQuestionAndAnswers } from '../utils/helperMethod';

const ExtractQuestion = () => {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [extractedPageText, setExtractedPageText] = useState([])
  const [questionsDatabase, setQuestionsDatabase] = useState([])
  const [questions, setQuestions] = useState('');
  const [extractedText, setExtractedText] = useState('')
  const [extractedImage, setExtractedImage] = useState(null)
  const [answerStyle, setAnswerStyle] = useState('')
  const [customAnswerStyle, setCustomAnswerStyle] = useState('')
  const [isExtracting, setIsExtracting] = useState(false);
  const [resetPage, setResetPage] = useState(false)
  const [currentRenderingPage, setCurrentRenderingPage] = useState(1)
  
  const textareaRef = useRef(null)
  const fileInput = useRef(null)
  const pdfFileRef = useRef(null)

  useEffect(() => {
    if (extractedPageText.length > 0) {
      setExtractedText(extractedPageText[pageNumber - 1]?.text)
      if(!extractedPageText[pageNumber - 1]?.image) return
      setExtractedImage(extractedPageText[pageNumber - 1]?.image)
      if (resetPage) {
        setResetPage(false)
        setQuestions([])
      }
    }
  }, [pageNumber, extractedPageText, resetPage])

 /**
  * The function `handleExtractContent` extracts text and images from each page of a PDF file using
  * PDF.js in a React application.
  */
  const handleExtractContent = async () => {
   /* The code `const blobUrl = URL.createObjectURL(pdfFile);` is creating a URL object from the PDF
   file, allowing it to be used as a source for loading the PDF file. */
    const blobUrl = URL.createObjectURL(pdfFile);
    const loadingTask = pdfjs.getDocument(blobUrl);
    const pagedData = []

    try {
      setIsExtracting(true)
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let canvasdiv = document.getElementById('canvas');

      // Iterate through each page and extract text
      for (let pageNumber = 1; pageNumber <= numPages; pageNumber++) {
        setCurrentRenderingPage(pageNumber)
        const page = await pdf.getPage(pageNumber);
        let getText = ''
        let getImage = ''
        const scale = 1.5;
        const viewport = page.getViewport({ scale: scale });
        const canvas = document.createElement('canvas');
        canvasdiv.appendChild(canvas);

      // Prepare canvas using PDF page dimensions
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = { canvasContext: context, viewport: viewport };
        await page.render(renderContext).promise
        getImage = canvas.toDataURL('image/png')

        // get Text from the pdf
        const textContent = await page.getTextContent();
        textContent.items.forEach((item) => {
          console.log(item)
          if ("str" in item) {
            if (item.hasEOL) {
              getText += item.str + " \n";
            } else {
              getText += item.str + " ";
            }
          }
        })

        pagedData.push({
          text: getText,
          image: getImage
        })
      }
    } catch (error) {
      // console.log(error)
    } finally {
      setIsExtracting(false)
      setCurrentRenderingPage(1)
    }
    
    setExtractedPageText(pagedData)
    setPageNumber(1)

    /* The code `URL.revokeObjectURL(blobUrl); loadingTask.destroy();` is used to clean up resources
    after extracting text from a PDF file. */
    URL.revokeObjectURL(blobUrl);
    loadingTask.destroy();
  }

  const handlePopulateQuestions = () => {
    const questionsDatabaseLength = questionsDatabase.length
    const { questionsAndAnswer } = extractQuestionAndAnswers({ extractedText, answerStyle, currentNumber: questionsDatabaseLength })
    setQuestions(questionsAndAnswer)
    setExtractedText('')
  }

  const updateQuestions = (index, q) => {
    const newQuestions = [...questions]
    newQuestions[index] = q
    setQuestions(newQuestions)
  }

  const updateQuestionDatabase = (values) => {
    const currentNumberOfQuestions = questionsDatabase.length
    let updatedData = [...questionsDatabase]
    values.forEach((question, index) => {
      const existingQuestion = questionsDatabase.find(q => q.question === question.question)
      const existingQuestionIndex = questionsDatabase.indexOf(existingQuestion)
      if (existingQuestion && existingQuestionIndex !== -1) {
        const tempQuestionDatabase = questionsDatabase.slice(0, questionsDatabase.indexOf(question))
        const restQuestionDaabase = questionsDatabase.slice(questionsDatabase.indexOf(question) + 1)
        updatedData = ([...tempQuestionDatabase, question, ...restQuestionDaabase])
        return
      }
      updatedData.push({ number: currentNumberOfQuestions + index + 1, ...question })
    })
    setQuestionsDatabase(updatedData)
    setQuestions([])
    setPageNumber(pageNumber + 1 <= numPages ? pageNumber + 1 : pageNumber)
  }

  const handleClear = () => {
    setExtractedText('')
    setQuestionsDatabase([])
    setQuestions([])
    setPdfFile(null)
    setAnswerStyle('')
    setCustomAnswerStyle('')
    setExtractedImage(null)
    setExtractedPageText([])
    if (fileInput.current)
      fileInput.current.value = ''
  }

  return (
    <>
      <div className={`${!isExtracting && 'p-4'} w-full flex flex-col-reverse xl:flex-row relative`} style={isExtracting ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
        {isExtracting && <div className="z-[99] absolute w-[100vw] h-[100vh] bg-gray-400 flex justify-center items-center opacity-50">
          <p className="text-[50px] font-extrabold text-gray-100 translate-y-[-50%]">Rendering page {currentRenderingPage}...</p>
        </div>}
        <div className="w-full xl:w-1/2 !z-[0]">
          <PdfViewerWrapper
            pdfFile={pdfFile}
            numPages={numPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            setNumPages={setNumPages}
            ref={pdfFileRef}
          />
        </div>
        <div className="w-full xl:w-1/2">
          <Panel>
            <LeftPanel>
              <div className="relative">
                {pdfFile && <div className="absolute left-0 right-0 w-full flex gap-2 justify-between items-center p-2">
                  {pdfFile && <div className="flex flex-col gap-2 justify-start items-center">
                    {!extractedPageText.length && <AnswerStyle
                      answerStyle={answerStyle}
                      setAnswerStyle={setAnswerStyle}
                      customAnswerStyle={customAnswerStyle}
                      setCustomAnswerStyle={setCustomAnswerStyle}
                    />}
                  </div>}
                  <ControlPanel
                    answerStyle={answerStyle}
                    setAnswerStyle={setAnswerStyle}
                    extractedText={extractedText}
                    extractedPageText={extractedPageText}
                    handlePopulateQuestions={handlePopulateQuestions}
                    handleExtractContent={handleExtractContent}
                    isExtracting={isExtracting}
                    disablePopulateButton={questions.length > 0}
                    setResetPage={setResetPage}
                  />
                  <MButton onClick={handleClear} type="danger" size="small" className="ml-auto">Reset All</MButton>
                </div>}
                <div className="flex flex-col justify-center items-center h-[40vh] text-md p-2 rounded-xl">
                  {!pdfFile && (
                    <form>
                      <label htmlFor="upload-pdf" className="cursor-pointer px-6 py-3 border-dashed border-2 border-gray-300 shadow-md rounded-md">
                        Upload PDF
                      </label>
                      <input
                        ref={fileInput}
                        id="upload-pdf"
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={(e) => setPdfFile(e.target.files[0])}
                      />
                    </form>)
                  }
                  
                  <textarea
                    ref={textareaRef}
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full mt-[90px] min-h-[95%] text-md p-2 border border-gray-300 rounded-xl outline-none"
                    style={{ display: !pdfFile || (pdfFile && !extractedText) ?  'none' : 'block' }}
                />
                </div>
              </div>
            </LeftPanel>
            <RightPanel defaultHeight="90%">
              <QuestionsCard
                questions={questions}
                questionsDatabaseLength={questionsDatabase.length}
                updateQuestions={updateQuestions}
                updateQuestionDatabase={updateQuestionDatabase}
                extractedImage={extractedImage}
              />
            </RightPanel>
          </Panel>
        </div>
      </div>
      <div id="canvas" className="hidden" ></div>
    </>
  )
}

export default ExtractQuestion
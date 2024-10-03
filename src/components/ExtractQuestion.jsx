import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import pdfToText from "react-pdftotext";

import QuestionsCard from './QuestionsCard';
import PdfViewer from './PdfViewer';
import { MButton } from './ReusableComponents'
import Panel, { LeftPanel, RightPanel } from './Panel'
import AnswerStyle from './AnswerStyle';
import ControlPanel from './ControlPanel';
import { base64toBlob,extractQuestionAndAnswers } from '../utils/helperMethod';

const ExtractQuestion = () => {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [extractedText, setExtractedText] = useState('')
  const [extractedImage, setExtractedImage] = useState(null)
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [selection, setSelection] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [answerStyle, setAnswerStyle] = useState('')
  const [customAnswerStyle, setCustomAnswerStyle] = useState('')
  const [extractedPageText, setExtractedPageText] = useState([])
  const [questionsDatabase, setQuestionsDatabase] = useState([])
  
  const textareaRef = useRef(null)
  const fileInput = useRef(null)

  useEffect(() => {
    textareaRef.current.addEventListener('selectionchange', getSelectedText)

    try {
      axios.get('http://localhost:80/ocr')
        .then((res) => console.log(res.data))
    } catch (error) {
      console.log(error)
    }
    return () => {
      textareaRef.current?.removeEventListener('selectionchange', getSelectedText)
    }
  }, [textareaRef.current?.selectionStart, textareaRef.current?.selectionEnd])

  useEffect(() => {
    if (extractedPageText.length > 0) {
      setExtractedText(extractedPageText[pageNumber - 1]?.text)
      if(!extractedPageText[pageNumber - 1]?.image) return
      const blob = base64toBlob(extractedPageText[pageNumber - 1]?.image, 'png');
      const blobUrl = URL.createObjectURL(blob);
      setExtractedImage(blobUrl)
    }
  }, [pageNumber, extractedPageText])

  const handleExtractContent = (e) => {
    e.preventDefault()

    if (!pdfFile) return
    setIsExtracting(true)
    axios.post('http://localhost:80/pdf-extract', {
      pdf: pdfFile
    }, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => {
        console.log({ data, text: data })
        const getPageData = []
        data.pages.forEach((page) => {
          let getText = ''
          page.content.forEach((value) => {
            getText += ' ' + value.str
          })
          getPageData.push({
            text: getText,
            image: page?.image
          })
        })
        console.log([ ...getPageData ])
        setExtractedPageText(getPageData)
        setPageNumber(1)
      })
      .catch((err) => console.log(err))
      .finally(() => setIsExtracting(false))
  }

  const handleExtractText = (e) => {
    e.preventDefault()
    if (!pdfFile) return
    setIsExtracting(true)
    axios.post('http://localhost:80/parse-text', {
      pdf: pdfFile
    }, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => {
        console.log({ data })
        console.log({data, text: data.data.text})
        setExtractedText(data.data.text)
      })
      .catch((err) => console.log(err))
      .finally(() => setIsExtracting(false))
    
  }

  const handleExtractPageText = (e) => {
    e.preventDefault()

    if (!pdfFile) return
    setIsExtracting(true)
    axios.post('http://localhost:80/pdf-text-reader', {
      pdf: pdfFile
    }, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then(({ data }) => {
        console.log(data.pages)
        setExtractedPageText(data.pages)
      })
      .catch((err) => console.log(err))
      .finally(() => setIsExtracting(false))
    
  }

  const extractText = async () => {
    try {
      setIsExtracting(true)
      const extracted = await pdfToText(pdfFile)
      setExtractedText(extracted)
      console.log(extracted)
    } catch (error) {
      console.log(error)
    } finally {
      setIsExtracting(false)
    }
  }

  const getSelectedText = () => {
    // console.log({ textSelection: document.getSelection().toString() })
    if (document.getSelection) {
      setSelection(document.getSelection().toString())
    }
  }

  const handlePopulateQuestions = () => {
    const { extractedTextCopy, questionsAndAnswer } = extractQuestionAndAnswers({ extractedText, answerStyle })
    setQuestions(questionsAndAnswer)
    setExtractedText(extractedTextCopy)
  }

  const separateAnswers = () => {
    const answersRegex = /[A-Z]\)\s?/g
    const selectedAnswers = selection.split(answersRegex)
    const formattedanswers = []
    selectedAnswers.forEach((answer) => {
      if(answer.trim()?.length) formattedanswers.push(answer.trim())
    })
    setQuestions([...questions, {
      question: question.replace(selection, ''),
      answers: formattedanswers
    }])
    console.log({ questions })
    setExtractedText(extractedText.replace(text, '').trim())
    setSelection('')
    setQuestion('')
    setAnswers([])
    setText('')
  }

  const processQuestion = () => {
    setText(selection)
    setQuestion(selection)
    setSelection('')
  }

  const updateQuestions = (index, question) => {
    const newQuestions = [...questions]
    newQuestions[index] = question
    setQuestions(newQuestions)
  }

  const updateQuestionDatabase = (values) => {
    setQuestionsDatabase([...questionsDatabase, ...values])
  }

  const handleClearSelection = () => {
    setSelection('')
    setQuestion('')
    setAnswers([])
    setText('')
  }

  const handleClear = () => {
    setExtractedText('')
    setQuestions([])
    setSelection('')
    setQuestion('')
    setAnswers([])
    setPdfFile(null)
    setAnswerStyle('')
    setCustomAnswerStyle('')
    setExtractedImage(null)
    setExtractedPageText([])
    if (fileInput.current)
      fileInput.current.value = ''
  }

  const handleClearQuestions = () => {
    setQuestions([])
    setSelection('')
    setQuestion('')
    setAnswers([])
  }

  return (
    <>
      <div className="p-4 w-full flex" style={isExtracting ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
        <div className="w-1/2">
            <PdfViewer
            pdfFile={pdfFile}
            numPages={numPages}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
            setNumPages={setNumPages}
          />
        </div>
        <div className="w-1/2">
          <Panel>
            <LeftPanel>
              <div className="relative">
                {pdfFile && <div className="absolute left-0 right-0 w-full flex justify-between items-center p-2">
                  <ControlPanel
                    answerStyle={answerStyle}
                    setAnswerStyle={setAnswerStyle}
                    extractedText={extractedText}
                    handlePopulateQuestions={handlePopulateQuestions}
                    handleExtractContent={handleExtractContent}
                    isExtracting={isExtracting}
                    handleExtractPageText={handleExtractPageText}
                  />
                  <MButton onClick={handleClear} type="danger" size="small" className="ml-auto">Reset</MButton>
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
                  {pdfFile && <div className="flex flex-col gap-2 justify-start items-center">
                    {!extractedText && <AnswerStyle
                      answerStyle={answerStyle}
                      setAnswerStyle={setAnswerStyle}
                      customAnswerStyle={customAnswerStyle}
                      setCustomAnswerStyle={setCustomAnswerStyle}
                    />}
                  </div>}
                  <textarea
                    ref={textareaRef}
                    value={question.length ? question : extractedText}
                    onChange={(e) => question.length ? setQuestion(e.target.value) : setExtractedText(e.target.value)}
                    className="w-full mt-[90px] min-h-[95%] text-md p-2 border border-gray-300 rounded-xl outline-none"
                    style={{ display: !pdfFile || (pdfFile && !extractedText) ?  'none' : 'block' }}
                />
                </div>
              </div>
            </LeftPanel>
            <RightPanel>
              <QuestionsCard
                questions={questions}
                handleClearQuestions={handleClearQuestions}
                updateQuestions={updateQuestions}
                updateQuestionDatabase={updateQuestionDatabase}
              />
            </RightPanel>
          </Panel>
        </div>
      </div>
        {extractedImage && <img src={extractedImage} alt="Extracted Image" className="w-full h-full object-cover" />}
    </>
  )
}

export default ExtractQuestion
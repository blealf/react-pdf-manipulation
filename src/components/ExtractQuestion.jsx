import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import OpenAI from 'openai';
import pdfToText from "react-pdftotext";
import QuestionsCard from './QuestionsCard';
import PdfViewer from './PdfViewer';

const ExtractQuestion = () => {
  const [pdfFile, setPdfFile] = useState(null)
  const [numPages, setNumPages] = useState();
  const [pageNumber, setPageNumber] = useState(1);
  const [extractedText, setExtractedText] = useState('')
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState('');
  const [question, setQuestion] = useState('');
  const [answers, setAnswers] = useState([]);
  const [selection, setSelection] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [answerStyle, setAnswerStyle] = useState('')
  const [customAnswerStyle, setCustomAnswerStyle] = useState('')


  const answerStyles = [ 'A)', '1)', '(A)', '(1)', 'A.)', '1.)', 'A).', '1).', '(A).', '(1).']
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
  }, [textareaRef.current?.selectionStart])

  const handleExtractContent = (e) => {
    e.preventDefault()

    if (pdfFile) {
      axios.post('http://localhost:80/pdf-extract', {
        pdf: pdfFile
      }, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(({ data }) => {
          console.log({ data, text: data.data.text })
          const getText = []
          data.data.pages.forEach((page) => {
            page.content.forEach((value) => {
              getText.push(value.str)
            })
          })
          console.log({ getText: getText.join('\r') })
          setExtractedText(getText.join('\r\n'))
        })
        .catch((err) => console.log(err))
        .finally(() => setIsExtracting(false))
    }
  }

  const handleExtractText = (e) => {
    e.preventDefault()

    if (pdfFile) {
      axios.post('http://localhost:80/parse-text', {
        pdf: pdfFile
      }, { headers: { 'Content-Type': 'multipart/form-data' } })
        .then(({ data }) => {
          console.log({data, text: data.data.text})
          setExtractedText(data.data.text)
          // setPdfFile(null)
          // fileInput.current.value = ''
        })
        .catch((err) => console.log(err))
        .finally(() => setIsExtracting(false))
    }
  }

  const aiTextManipulation = async (e) => {
    e.preventDefault()
    const openai = new OpenAI({
        apiKey: '',
        dangerouslyAllowBrowser: true
    });
    const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {"role": "user", "content": "write a haiku about ai"}
        ]
    });
    console.log({ completion })
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
    let pattern
    const numberOfAnswers = 4
    const formatAnswerStyle = answerStyle.toUpperCase()
    const mapNumToLetter = { 1: 'A', 2: 'B', 3: 'C', 4: 'D' }

    if (/[a-zA-Z]/gmi.test(formatAnswerStyle)) {
      for (let i = 0; i < numberOfAnswers; i++) {
        if (!pattern) {
          pattern = formatAnswerStyle.replace(/[A-Z]/g, mapNumToLetter[i + 1])
        } else {
          pattern = pattern + '|' + formatAnswerStyle.replace(/[A-Z]/g, mapNumToLetter[i + 1])
        }
      }
    } else if (/[1-9]/gmi.test(formatAnswerStyle)) {
      for (let i = 0; i < numberOfAnswers; i++) {
        if (!pattern) {
          pattern = formatAnswerStyle.replace(/[1-9]/g, mapNumToLetter[i + 1])
        } else {
          pattern = pattern + '|' + formatAnswerStyle.replace(/[1-9]/g, mapNumToLetter[i + 1])
        }
      }
    }

    const escapedPattern = pattern.replace(/([.*+?^=!:${}()\[\]\/\\])/g, "\\$1").trim();
    const answerRegex = new RegExp(escapedPattern, 'ig')

    console.log({ answerRegex, test: answerRegex.test('A)') })

    const matches = extractedText.match(answerRegex)

    if (matches) {
      console.log({ matches, lenght: matches.length })
    }
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
      
      <div className="p-4 w-full" style={ isExtracting ? { pointerEvents: 'none', opacity: 0.5 } : {}}>
        <h1 className="text-2xl">Extract Question</h1>
        <div className="flex flex-col md:flex-row justify-center items-start gap-2 w-full">
          <div className="w-full md:!min-w-1/2">
            <div className="flex justify-between items-center px-4 py-2">
              <h3 className="text-xl font-[500]">Extracted Text</h3>
              {pdfFile && <button onClick={handleClear} className="bg-gray-500 text-white px-4 py-1 rounded-md">clear</button>}
            </div>
            <div className="flex flex-col justify-center items-center min-h-[60vh] text-md shadow-md border border-gray-300 p-2 rounded-xl">
              
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
                {!extractedText && <div className="flex flex-col md:flex-row gap-2 justify-center items-center  px-1 py-3">
                  <h3 className="block">Select answer style:</h3>
                  {answerStyles.includes(answerStyle) || answerStyle === '' && (
                    <select
                      className="p-2 text-lg font-[500] outline-none cursor-pointer"
                      defaultValue=""
                      onChange={(e) => setAnswerStyle(e.target.value)}
                    >
                      <option value="" disabled>Select your option</option>
                      {answerStyles.map((style) => (
                        <option  value={style} key={style}>{style}</option>
                      ))}
                      <option value="custom">Custom</option>
                    </select>
                  )}
                  {answerStyle === 'custom' && <div className="flex flex-col md:flex-row justify-center gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Enter answer style"
                      className="p-2 text-lg font-[500] outline-gray-300 border border-gray-300 max-w-[100px] rounded-lg"
                      onChange={(e) => setCustomAnswerStyle(e.target.value)}
                    />
                    <button
                      className="bg-blue-500 text-white text-lg px-4 py-2 rounded-md w-full md:w-auto"
                      onClick={() => setAnswerStyle(customAnswerStyle)}
                    >Set</button>
                  </div>}
                </div>}
                {(!extractedText && answerStyle && answerStyle !== 'custom') && <div className="flex gap-2 items-center my-2">
                  <p className="font-[600] p-2 border border-dashed border-gray-300 rounded-lg">{answerStyle}</p>
                  <button
                    className="bg-red-500 text-white px-4 py-1 rounded-md flex justify-center items-center text-xl font-[600]"
                    onClick={() => setAnswerStyle('')}
                  ><span className="pb-1">x</span></button>
                </div>}
                <div className="flex flex-col md:flex-row gap-2 justify-start items-center">
                {!extractedText && <>
                  <button
                    onClick={handleExtractText}
                    disabled={!answerStyle || answerStyle === 'custom'}
                    className="w-full md:w-auto bg-blue-500 text-white px-7 py-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    Extract Text
                  </button>
                  <button
                    onClick={handleExtractContent}
                    disabled={!answerStyle || answerStyle === 'custom'}
                    className="w-full md:w-auto bg-teal-500 text-white px-7 py-3 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed"
                  >
                    Extract content
                  </button>
                  {/* <button
                    onClick={extractText}
                    disabled={!pdfFile}
                    className="bg-teal-500 text-white px-7 py-3 rounded-md"
                  >
                    Client Extract
                  </button> */}
                </>}
                {/* <button onClick={aiTextManipulation} disabled={!extractedText}>Manipulate</button> */}
                </div>
              </div>}
              {extractedText && <div className="flex gap-2 items-center">
                <div>
                  <button onClick={handlePopulateQuestions} className="bg-gray-500 text-white px-4 py-1 rounded-md">Populate Questions</button>
                </div>
                {selection && !question && (
                  <button
                    onClick={processQuestion}
                    disabled={!selection}
                    className="bg-gray-500 text-white px-4 py-1 rounded-md"
                  >
                    Select Question and anwers
                  </button>
                )}
                {question && ( <>
                  <button
                    onClick={separateAnswers}
                    disabled={!selection}
                    className="bg-green-500 text-white px-4 py-1 rounded-md"
                  >
                    Separate answers
                  </button>
                  <button
                    onClick={handleClearSelection}
                    className="bg-red-500 text-white px-4 py-1 rounded-md"
                  >
                    Clear Selection
                  </button>
                </>
                )}
              </div>}
              <textarea
                ref={textareaRef}
                value={question.length ? question : extractedText}
                onChange={(e) => question.length ? setQuestion(e.target.value) : setExtractedText(e.target.value)}
                className="w-full h-[50vh] text-md p-2 border border-gray-300 rounded-xl outline-none mt-2"
                style={{ display: !pdfFile || (pdfFile && !extractedText) ?  'none' : 'block' }}
            />
            </div>
          </div>
          <div className="w-full md-w-1/2 ">
            <QuestionsCard questions={questions} handleClearQuestions={handleClearQuestions} />
          </div>
        </div>

        <PdfViewer
          pdfFile={pdfFile}
          numPages={numPages}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
          setNumPages={setNumPages}
        />
      </div>
    </>
  )
}

export default ExtractQuestion
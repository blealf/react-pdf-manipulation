/* eslint-disable react/prop-types */
import { useEffect, useState, useRef } from 'react'
import { FaCheck, FaEdit } from "react-icons/fa";
import { FcCancel } from "react-icons/fc";
import { MdDeleteForever } from "react-icons/md";
import { MButton } from './ReusableComponents'
import ImageModal from './ImageModal'

const QuestionsCard = ({ questions, updateQuestions, updateQuestionDatabase, extractedImage, questionsDatabaseLength }) => {
  const [editing, setEditing] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [editedQuestion, setEditedQuestion] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentIndex, setCurrentIndex] = useState(null)
  const [allValidated, setAllValidated] = useState(false)
  const [showImageModal, setShowImageModal] = useState(false)
  const [imageSrc, setImageSrc] = useState(null)
  const [selection, setSelection] = useState('')

  const currentQuestionRef = useRef()
  const deleteBtnRef = useRef()
  const containerRef = useRef()

  /**
   * This function maps an index to a specific color class based on the index value.
   * @returns The function `mapColor` returns a string representing a CSS class based on the input
   * `index`. If `index` is 0, it returns 'bg-sky-600', if it's 1, it returns 'bg-teal-600', if it's 2,
   * it returns 'bg-yellow-600', if it's 3, it returns 'bg-red-600',
   */
  const mapColor = (index) => {
    if (index === 0) return 'bg-sky-600'
    if (index === 1) return 'bg-teal-600'
    if (index === 2) return 'bg-yellow-600'
    if (index === 3) return 'bg-red-600'
    return 'bg-gray-600'
  }

  useEffect(() => {
    if(extractedImage) {
      setImageSrc(extractedImage)
    }
    if (questions.length) {
      setAllValidated(questions.every((question) => question.validated) && !editing)
      setCurrentIndex(currentIndex || 0)
      setCurrentQuestion(questions[currentIndex || 0])
    } else {
      setCurrentQuestion(null)
      setCurrentIndex(null)
    }
  }, [currentIndex, questions, editing, extractedImage, ])


  useEffect(() => {
    currentQuestionRef.current?.addEventListener('selectionchange', getSelectedText)

    return () => {
      currentQuestionRef?.current?.removeEventListener('selectionchange', getSelectedText)
    }
  }, [currentQuestionRef.current?.selectionStart, currentQuestionRef.current?.selectionEnd, currentQuestion])

  const getSelectedText = () => {
    const selection = window.getSelection();
    const selectedString = selection.toString();
    const deleteButton = deleteBtnRef.current;

    if (selectedString.length > 0) {
      setSelection(selectedString.trim());
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Adjust for container's offset position
      const containerRect = containerRef.current.getBoundingClientRect()
      deleteButton.style.display = 'flex';
      deleteButton.style.top = `${(rect.top - containerRect.top) + rect.height}px`;
      deleteButton.style.left = `${rect.left - containerRect.left }px`;
    }
  }

  const handleDeleteSelection = (e) => {
    e.stopPropagation();

    const newQuestion = currentQuestion.question?.replace(selection.trim(), '')
    handleSaveQuestion(null, {...currentQuestion, question: newQuestion})
    setSelection('');
    deleteBtnRef.current.style.display = 'none';
  }

  const handleSelectQuestion = (index) => {
    setCurrentIndex(index)
    setCurrentQuestion(questions[index])
    setEditIndex(null)
    setEditing(false)
    setSelection('')
  }

  const handleEditQuestion = () => {
    setEditing(true)
    setEditIndex(currentIndex)
    setEditedQuestion({ ...currentQuestion, question: currentQuestion.question, validated: false })
  }

  const insertAnswer = (array, index, value) => {
    const otherAnswers = [...array.answers.filter((_, i) => i !== index).map((ans) => ({ ...ans, valid: false }))]
    otherAnswers.splice(index, 0,
      {
        value: array.answers[index].value,
        valid: value
      })
    return otherAnswers
  }

  const handleUpdateAnswers = (index, value, isCorrectAnswer) => {
    if (isCorrectAnswer) {
      if (editIndex !== null) {
        const otherAnswers = insertAnswer(editedQuestion, index, value)
        setEditedQuestion({
          ...editedQuestion,
          answers: otherAnswers
        })
      } else {
        const otherAnswers = insertAnswer(currentQuestion, index, value)
        setCurrentQuestion({ ...currentQuestion, answers: otherAnswers })
        handleSaveQuestion(null, { ...currentQuestion, answers: otherAnswers })
      }
      return
    }
    const answers = [
        ...editedQuestion.answers.slice(0, index),
        {
          value,
          valid: editedQuestion.answers[index].valid
        },
        ...editedQuestion.answers.slice(index + 1)
    ]
    setEditedQuestion({
      ...editedQuestion,
      answers,
    })
  }

  const canValidate = () => {
    if (questions[currentIndex]?.answers?.length === 0) return false
    return questions[currentIndex]?.answers?.some((answer) => answer.valid)
  }

  const handleSaveQuestion = (e, question) => {
    if (question) {
      updateQuestions(currentIndex, question)
    } else {
      updateQuestions(editIndex, editedQuestion)
    }
    setEditing(false)
    setEditIndex(null)
    // setAllValidated(false)
  }

  const handleValidateQuestion = () => {
    updateQuestions(currentIndex, { ...currentQuestion, validated: true })
    setCurrentIndex(currentIndex + 1 < questions.length ? currentIndex + 1 : 0)
  }

  const handleDeleteImage = (index) => {
    updateQuestions(currentIndex, { ...currentQuestion, images: currentQuestion.images?.filter((_, i) => i !== index) })
  }

  const handleSaveAll = () => {
    updateQuestionDatabase(questions)
  }

  const handleInsertCroppedImage = (image) => {
    if (currentQuestion?.images) {
      updateQuestions(currentIndex, { ...currentQuestion, images: [...currentQuestion.images, image] })
    } else {
      updateQuestions(currentIndex, { ...currentQuestion, images: [image] })
    }
    setShowImageModal(false)
  }
  
  return (
    <div className="h-full">
      <ImageModal
        imageSrc={imageSrc}
        showImageModal={showImageModal}
        setShowImageModal={setShowImageModal}
        insertCroppedImage={handleInsertCroppedImage}
      />
      <div className="rounded-xl text-md shadow-md border border-gray-300 p-2">
        <div className=" flex rounded-md items-center">
          <div className="flex max-w-[50%] overflow-x-scroll">
            {!!questions.length && questions.map((_, index) => (
              <div
                key={index}
                className={`${currentIndex !== index ? 'bg-gray-500' : mapColor(index % 4)} ${currentIndex === index ? 'py-3 w-[70px] rounded-b-lg' : 'mb-1'} min-w-[80px] flex justify-center items-center px-5 py-2 shadow-md cursor-pointer text-white font-bold rounded-sm`}
                style={{ scrollbarWidth: 'thin' }}
                onClick={() => handleSelectQuestion(index)}>
                <span>{index + questionsDatabaseLength + 1}</span>
                {questions[index]?.validated && <FaCheck className="ml-2 text-green-500 rotate-30" />}
              </div>
            ))}
          </div>
          {!!questions.length && <div className="flex items-center justify-end  gap-2 ml-auto">
            {!!imageSrc && !editing && <MButton type="primary" className="ml-auto "  size="small" onClick={() => setShowImageModal(true)}>Insert Image/Table</MButton>}
            {!allValidated && !currentQuestion?.validated && <MButton
              size="small"
              type="success"
              className="ml-auto"
              disabled={currentQuestion?.validated || !canValidate()}
              onClick={handleValidateQuestion}
            >{!canValidate() && <FcCancel className="text-lg" />}<span className="ml-1">Validate</span></MButton>}
            {allValidated && <MButton
              size="small"
              type="success"
              className="ml-auto !bg-sky-600"
              onClick={handleSaveAll}
            >Save Questions</MButton>}
          </div>}
        </div>
        <div className="overflow-y-scroll max-h-[80%] mt-1 text-gray-700 font-sans leading-8">
          {currentQuestion && (
            <div className={`p-2 border border-[${mapColor(currentIndex)}}] shadow-md rounded-md mb-2`}>
              {editIndex !== currentIndex &&
                <MButton
                  type="warning"
                  onClick={handleEditQuestion}
                  className="absolute !w-[50px] bottom-4 right-10 !bg-yellow-600 hover:!bg-yellow-700 text-white rounded-md"
                >
                  <span>Edit</span>
                  <FaEdit className="ml-2" />
                </MButton>}
              {editing && editIndex === currentIndex ?
                (<div className="flex flex-col gap-2 ">
                  <textarea
                    type="text"
                    value={editedQuestion.question}
                    onChange={(e) => setEditedQuestion({ ...editedQuestion, question: e.target.value })}
                    className="text-md min-h-[250px] border border-gray-300 p-2 rounded-md"
                  />
                  {!!editedQuestion.answers && editedQuestion.answers.map((answer, idx) => (
                    <div key={idx} className="flex gap-2">
                      <span>{ idx+ 1}. </span>
                      <textarea
                        type="text"
                        defaultValue={answer?.value}
                        onChange={(e) => handleUpdateAnswers(idx, e.target.value)}
                        className={`text-md border-[${mapColor(idx)}] min-h-[35px] h-[35px] w-[70%] border px-2 rounded-sm ${answer.valid && 'border-2 border-teal-500'}`} />
                      <MButton
                        type="secondary"
                        size="small"
                        className={`min-w-[60px] w-[60px] !px-2 flex gap-1 justify-center items-center opacity-50 hover:opacity-100 hover:bg-green-600 !h-[30px] !rounded-[5px] !py-1 ${answer.valid && '!bg-teal-500 opacity-100'}`}
                        onClick={() => handleUpdateAnswers(idx, true, true)}
                      >ANS {answer.valid && <FaCheck />}</MButton>
                    </div>
                  ))}
                  <MButton onClick={handleSaveQuestion} className="w-full mt-2 bg-teal-500 hover:bg-teal-700">Update</MButton>
                </div>)
                : <div  className="px-2">
                  <div ref={containerRef} className="flex gap-2">
                    <p><strong>{currentIndex + questionsDatabaseLength + 1}.</strong></p>
                    <p ref={currentQuestionRef} onMouseUp={getSelectedText} className="relative">
                      {currentQuestion.question}
                      <span
                        ref={deleteBtnRef}
                        className="hidden absolute w-10 h-10 rounded-full border border-gray-200 bg-red-500 
                          justify-center items-center shadow-md cursor-pointer"
                        onClick={handleDeleteSelection}
                      ><MdDeleteForever className="text-2xl text-white " /></span>
                    </p>
                  </div>
                  <div className="w-full flex flex-col gap-2 justify-start items-center">
                    {currentQuestion.images && currentQuestion.images.map((image, idx) => (
                      <div key={idx} className="w-full flex justify-start items-end">
                        <img src={image} alt="image" className="w-[80%] h-[200px] object-cover rounded-md border border-gray-300" />
                        <p className="cursor-pointer text-[50px]" onClick={() => handleDeleteImage(idx)} >
                          <MdDeleteForever className=" text-red-500 hover:text-red-300" />
                        </p>
                      </div>
                    ))}
                  </div>
                  <h3 className="mt-3 mb-1 font-bold">Answers</h3>
                  {currentQuestion.answers.map((answer, idx) => (
                    <p key={idx} className={`capitalize grid grid-cols-[30px_1fr_50px] gap-2 max-w-[300px]`}>
                      <span>{idx + 1}. </span>
                      <span>{answer.value}</span>
                      {answer.valid ? <span
                        className="flex justify-center items-center text-xs gap-1 border 
                        border-green-500 px-2 rounded-md text-green-500 mb-1 min-w-[60px] h-[30px]"
                        >ANS <FaCheck /></span> :
                        <MButton
                          type="secondary"
                          size="small"
                          className={`min-w-[60px] w-[60px] !px-2 flex gap-1 justify-center items-center opacity-50 
                            hover:opacity-100 hover:bg-green-600 !h-[30px] !rounded-[5px] ${answer.valid && '!bg-teal-500 opacity-100'}`}
                          onClick={() => handleUpdateAnswers(idx, true, true)}
                        >
                          ANS {answer.valid && <FaCheck />}
                        </MButton>
                      }
                    
                    </p>
                  ))}
                </div>}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default QuestionsCard
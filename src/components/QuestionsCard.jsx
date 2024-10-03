/* eslint-disable react/prop-types */
import { useEffect, useState } from 'react'
import { FaCheck, FaEdit } from "react-icons/fa";
import { MButton } from './ReusableComponents'

const QuestionsCard = ({ questions, updateQuestions, updateQuestionDatabase }) => {
  const [editing, setEditing] = useState(false)
  const [editIndex, setEditIndex] = useState(null)
  const [editedQuestion, setEditedQuestion] = useState({})
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [currentIndex, setCurrentIndex] = useState(null)
  const [tabWidth, setTabWidth] = useState(0)
  const [allValidated, setAllValidated] = useState(false)

  const mapColor = (index) => {
    if (index === 0) return 'bg-sky-600'
    if (index === 1) return 'bg-teal-600'
    if (index === 2) return 'bg-yellow-600'
    if (index === 3) return 'bg-red-600'
    return 'bg-gray-600'
  }

  useEffect(() => {

    if (questions.length) {
      setAllValidated(questions.every((question) => question.validated))
      console.log({ questions })
      setCurrentIndex(currentIndex || 0)
      setCurrentQuestion(questions[currentIndex || 0])
      setTabWidth(100 / questions.length)
    } else {
      setCurrentQuestion(null)
      setCurrentIndex(null)
    }
  }, [currentIndex, questions])

  const handleSelectQuestion = (index) => {
    setCurrentIndex(index)
    setCurrentQuestion(questions[index])
    setEditIndex(null)
    setEditing(false)
  }

  const handleEditQuestion = () => {
    setEditing(true)
    setEditIndex(currentIndex)
    setEditedQuestion({ question: currentQuestion.question, answers: currentQuestion.answers })
  }

  const handleupdateAnswers = (index, value, isCorrentAnswer) => {
    console.log({ index, value, isCorrentAnswer })
    if (isCorrentAnswer) {
      const otherAnswers = [...editedQuestion.answers.filter((_, i) => i !== index).map((ans) => ({ ...ans, valid: false }))]
      otherAnswers.splice(index, 0,
        {
          value: editedQuestion.answers[index].value,
          valid: value
        })
      setEditedQuestion({
      ...editedQuestion,
        answers: otherAnswers
      })
      return
    }
    setEditedQuestion({
      ...editedQuestion,
      answers: [
        ...editedQuestion.answers.slice(0, index),
        {
          value: value,
          valid: editedQuestion.answers[index].valid
        },
        ...editedQuestion.answers.slice(index + 1)
      ]
    })
  }

  const handleSaveQuestion = () => {
    updateQuestions(editIndex, editedQuestion)
    setEditing(false)
    setEditIndex(null)
    setAllValidated(false)
  }

  const handleValidateQuestion = () => {
    updateQuestions(currentIndex, { ...currentQuestion, validated: true })
  }

  const handleSaveAll = () => {
    console.log("++++++ SSSSSAAAAAAVVVVVEEEEEEDDDDDD ++++++++")
    updateQuestionDatabase(questions)
  }
  
  return (
    <div className="h-full">
      <div className="flex justify-between items-center px-4 py-2">
        {/* <h3 className="text-lg font-[500]">Validate Questions</h3> */}
        {/* {!!questions.length && <button onClick={handleClearQuestions} className="bg-gray-500 text-white px-4 py-1 rounded-md">clear</button>} */}
      </div>
      <div className="rounded-xl text-md shadow-md border border-gray-300 p-2">
        <div className=" flex rounded-md">
          {!!questions.length && questions.map((_, index) => (
            <div
              key={index}
              className={`${currentIndex !== index ? 'bg-gray-500' : mapColor(index)} ${currentIndex === index ? 'py-3 w-[70px]' : 'mb-1'} w-[${tabWidth}%] min-w-[50px] flex justify-center items-center px-5 py-2 shadow-md cursor-pointer text-white font-bold rounded-sm`}
              onClick={() => handleSelectQuestion(index)}>
              <span>{index + 1}</span>
              {questions[index]?.validated && <FaCheck className="ml-2 text-green-500 rotate-30" />}
            </div>
          ))}
          <div className="flex items-center justify-end  gap-2 ml-auto">
            {!!questions.length && <MButton className="ml-auto bg-green-600" disabled={questions[currentIndex]?.validated} size="small" type="success" onClick={handleValidateQuestion}>Validate</MButton>}
            {!!questions.length && allValidated && <MButton className="ml-auto bg-green-600" size="small" type="success" onClick={handleSaveAll}>Save Questions</MButton>}
          </div>
        </div>
        <div className="overflow-y-scroll max-h-[80%] mt-1">
          {currentQuestion && (
            <div className={`relative p-2 border border-[${mapColor(currentIndex)}}] shadow-md rounded-md mb-2`}>
              {editIndex !== currentIndex &&
                <MButton
                  type="warning"
                  onClick={handleEditQuestion}
                  className="absolute bottom-4 right-4 bg-gray-500 text-white px-4 py-1 rounded-md"
                >
                  <span>Edit</span>
                  <FaEdit className="ml-2" />
                </MButton>}
              {editing && editIndex === currentIndex ?
                (<div className="flex flex-col gap-2">
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
                        value={answer?.value}
                        onChange={(e) => handleupdateAnswers(idx, e.target.value)}
                        className={`text-md border-[${mapColor(idx)}] h-[30px] border px-2 rounded-sm`} />
                      <MButton
                        type="secondary"
                        size="small"
                        className={`flex gap-1 justify-center items-centeropacity-50 hover:opacity-100 hover:bg-green-600 !h-[30px] !w-[70px] !py-1 ${answer.valid && 'bg-teal-500'}`}
                        onClick={() => handleupdateAnswers(idx, true, true)}
                      >ANS {answer.valid && <FaCheck />}</MButton>
                    </div>
                  ))}
                  <MButton onClick={handleSaveQuestion} className="w-full mt-2 bg-teal-500 hover:bg-teal-700">Update</MButton>
                </div>)
                : <div>
                  <p>{currentIndex + 1}. {currentQuestion.question}</p>
                  {currentQuestion.answers.map((answer, idx) => (
                    <p key={idx} className="flex gap-2 max-w-[300px]">{idx + 1}. {answer.value} {answer.valid && <span className="flex justify-center items-center text-xs gap-1 border border-green-500 px-1 rounded-md text-green-500">ANS <FaCheck  /></span>}</p>
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
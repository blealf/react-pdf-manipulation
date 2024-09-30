/* eslint-disable react/prop-types */

const QuestionsCard = ({ questions, handleClearQuestions }) => {
  return (
    <div>
      <div className="flex justify-between items-center px-4 py-2">
        <h3 className="text-xl font-[500]">Questions</h3>
        {!!questions.length && <button onClick={handleClearQuestions} className="bg-gray-500 text-white px-4 py-1 rounded-md">clear</button>}
      </div>
      <div className="rounded-xl min-h-[60vh] max-h-[60vh] text-md shadow-md border border-gray-300 p-2 overflow-y-scroll">
        {questions.length ? questions.map(({ question, answers}, index) => (
          <div key={index} className="p-2 border border-gray-300 shadow-md rounded-md mb-2">
            <p>{index + 1}. {question}</p>
            {answers.map((answer, idx) => (
              <p key={idx}>{idx + 1}. {answer}</p>
            ))}
          </div>
        )) : null}
      </div>
    </div>
  )
}

export default QuestionsCard
import PropTypes from 'prop-types'
import { MButton } from './ReusableComponents'

const ControlPanel = ({ answerStyle, extractedText, handlePopulateQuestions, handleExtractContent, isExtracting, handleExtractPageText }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 justify-start items-center">
      <div className="flex flex-col md:flex-row gap-2 justify-start items-center">
      {!extractedText && <>
        {/* <MButton
          onClick={handleExtractText}
          disabled={!answerStyle || answerStyle === 'custom'}
        >
          Extract Text
        </MButton> */}
        <MButton
          onClick={handleExtractContent}
          disabled={!answerStyle || answerStyle === 'custom'}
          type="success"
          size="small"
          loading={isExtracting}
        >
          Extract Questions
        </MButton>
        {/* <MButton
          onClick={extractText}
          disabled={!answerStyle || answerStyle === 'custom'}
          loading={isExtracting}
        >
          Client Extract
        </MButton> */}
        {/* <MButton
          onClick={handleExtractPageText}
          disabled={!answerStyle || answerStyle === 'custom'}
          size="small"
          loading={isExtracting}
        >
          Extract Questions
        </MButton> */}
      </>}
    </div>
      {extractedText && <div className="flex gap-2 items-center">
        <div>
          <MButton onClick={handlePopulateQuestions} size="small">Populate Questions</MButton>
        </div>
        {/* {selection && !question && (
          <button
            onClick={processQuestion}
            disabled={!selection}
            className="bg-gray-500 text-white px-4 py-1 rounded-md"
          >
            Select Question and anwers
          </button>
        )} */}
        {/* {question && ( <>
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
        )} */}
      </div>}
    </div>
  )
}

ControlPanel.propTypes = {
  answerStyle: PropTypes.string,
  extractedText: PropTypes.string,
  handleExtractContent: PropTypes.func,
  handlePopulateQuestions: PropTypes.func,
  handleExtractPageText: PropTypes.func,
  isExtracting: PropTypes.bool,
}

export default ControlPanel

import PropTypes from 'prop-types'
import { MButton } from './ReusableComponents'

const ControlPanel = ({ answerStyle, extractedText, extractedPageText, handlePopulateQuestions, disablePopulateButton, handleExtractContent, isExtracting, setResetPage }) => {
  return (
    <div className="flex flex-col md:flex-row gap-2 justify-start items-center">
      <div className="flex flex-col md:flex-row gap-2 justify-start items-center">
      {!extractedPageText?.length && <>
        <MButton
          onClick={handleExtractContent}
          type="success"
          size="small"
          loading={isExtracting}
          className="bg-teal-600"
          disabled={!answerStyle || answerStyle === 'custom'}
        >
          Extract Questions
        </MButton>
        
      </>}
    </div>
      <div className="flex gap-2 justify-start items-center">
        {!!extractedText?.length && <div className="flex gap-2 items-center">
          <MButton onClick={handlePopulateQuestions} size="small" disabled={disablePopulateButton}>Populate Questions</MButton>
        </div>}
        {!!extractedPageText?.length && answerStyle && <MButton
          onClick={setResetPage}
          disabled={!answerStyle || answerStyle === 'custom'}
          type="warning"
          size="small"
          className="bg-teal-600"
        >
          Reset Page
        </MButton>}
      </div>
    </div>
  )
}

ControlPanel.propTypes = {
  answerStyle: PropTypes.string,
  extractedText: PropTypes.string,
  extractedPageText: PropTypes.array,
  handleExtractContent: PropTypes.func,
  handlePopulateQuestions: PropTypes.func,
  isExtracting: PropTypes.bool,
  disablePopulateButton: PropTypes.bool,
  setResetPage: PropTypes.func
}

export default ControlPanel

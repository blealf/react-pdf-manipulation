import PropTypes from 'prop-types'
import { MButton } from './ReusableComponents'

const answerStyles = ['A)', '1)', '(A)', '(1)', 'A.)', '1.)', 'A).', '1).', '(A).', '(1).']

const AnswerStyle = ({ answerStyle, setAnswerStyle, customAnswerStyle, setCustomAnswerStyle }) => {
  return (
    <div className="flex gap-2 justify-center items-center  px-1 py-3">
      <div className="flex justify-center items-center rounded-lg shadow-md p-2">
        {answerStyles.includes(answerStyle) || answerStyle === '' && (
          <select
            className="p-2 text-md font-[500] outline-none cursor-pointer"
            defaultValue=""
            onChange={(e) => setAnswerStyle(e.target.value)}
          >
            <option value="" disabled>Select answer option style</option>
            {answerStyles.map((style) => (
              <option value={style} key={style}>{style}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
        )}
      </div>
      {answerStyle === 'custom' && <div className="flex justify-center gap-2 items-center">
        <input
          type="text"
          placeholder="Enter answer style"
          className="p-2 text-lg font-[500] outline-gray-300 border border-gray-300 max-w-[150px] rounded-lg"
          onChange={(e) => setCustomAnswerStyle(e.target.value)}
        />
        <MButton
          className="py-3"
          onClick={() => setAnswerStyle(customAnswerStyle)}
          size="small"
        >Set</MButton>
      </div>}
      {(answerStyle && answerStyle !== 'custom') && <div className="flex gap-2 items-center my-2">
        <p className="font-[600] p-2 ">Selected style: <span className="border border-dashed border-gray-300 rounded-lg">{answerStyle}</span> </p>
        <MButton
          size="small"
          type="danger"
          onClick={() => setAnswerStyle('')}
        ><span className="pb-1">Clear</span></MButton>
      </div>}
    </div>
  )
}

AnswerStyle.propTypes = {
  answerStyle: PropTypes.string.isRequired,
  setAnswerStyle: PropTypes.func.isRequired,
  customAnswerStyle: PropTypes.string.isRequired,
  setCustomAnswerStyle: PropTypes.func.isRequired
}

export default AnswerStyle
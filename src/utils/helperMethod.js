const processAnswerPattern = ({ extractedText, answerStyle, numberOfAnswers }) => {
  let pattern
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
  // eslint-disable-next-line no-useless-escape
  const escapedPattern = pattern.replace(/([.*+?^=!:${}()\[\]\/\\])/g, "\\$1").trim();
  const answerRegex = new RegExp(escapedPattern, 'ig')
  const matches = extractedText.match(answerRegex)
  
  return {matches, answerRegex}
}

export const cleanupString = (str) => str.replace(/[\n\r]/g, '').replace(/\s\s+/g, ' ').trim()

export const extractQuestionAndAnswers = ({ extractedText, answerStyle, currentNumber }) => {
  const numberOfAnswers = 4
  const {matches, answerRegex} = processAnswerPattern({ extractedText, answerStyle, numberOfAnswers })

  if (!matches) return { extractedTextCopy: extractedText, questionsAndAnswer: [] }
  
  let extractedTextCopy = extractedText
  const firstQuestion = cleanupString(extractedTextCopy.slice(0, extractedTextCopy.indexOf(matches[0])))
  extractedTextCopy = extractedTextCopy.replace(firstQuestion, '')
  const questionsAndAnswer = [{ question: firstQuestion, answers: [] }]

  for (let i = 0; i < matches.length;) {
    const currentIndex = extractedTextCopy.indexOf(matches[i])
    const nextIndex = extractedTextCopy.indexOf(matches[i + 1])

    if (!extractedTextCopy.slice(currentIndex, currentIndex + 3).length) continue

    let extractedAnswer
    const currentQuestionIndex = questionsAndAnswer.length - 1

    if (i === 0 || (i + 1) % numberOfAnswers !== 0) {
      extractedAnswer = extractedTextCopy.slice(currentIndex, nextIndex)
    } else {
      const lastAnswerMatch = extractedTextCopy.slice(currentIndex, nextIndex)
      let lastAnswer = lastAnswerMatch.slice(0, lastAnswerMatch.indexOf('\n'))
      try {
        lastAnswer = lastAnswerMatch.slice(0, lastAnswerMatch.indexOf(lastAnswerMatch.match(/\d/gi)[0]))
      } catch (error) {
        // console.log(error)
      }
      extractedAnswer = lastAnswer
      const lastIndexOfLastAnswer = currentIndex + extractedAnswer.length

      if(matches[ i + 1]?.length) {
        questionsAndAnswer.push({
          question: cleanupString(extractedTextCopy.slice(lastIndexOfLastAnswer, nextIndex)),
          answers: []
        })
        extractedTextCopy = extractedTextCopy.replace(extractedTextCopy.slice(lastIndexOfLastAnswer, nextIndex), '')
      }
    }
    
    questionsAndAnswer[currentQuestionIndex].answers.push({ value: extractedAnswer.replace(answerRegex, '').replace(/\s\s+/g, ' ').trim() })
    // questionsAndAnswer[currentQuestionIndex].answers.push({ value: extractedAnswer})
    extractedTextCopy = extractedTextCopy.replace(extractedAnswer, '')
    i += 1
  }


  return {
    extractedTextCopy,
    questionsAndAnswer
  }
}

export const base64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }
    
  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}
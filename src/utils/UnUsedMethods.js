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

  const convertPDFToDataURL = () => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = function() {
        try {
          // Convert binary data to base64 and create a Data URL
          const base64String = reader.result.split(',')[1];
          const dataUrl = `data:application/pdf;base64,${base64String}`;
          resolve(dataUrl); // Resolve the promise with the data URL
        } catch (error) {
          reject(error); // Reject in case of any errors
        }
      };

      reader.onerror = function() {
        reject(reader.error); // Reject if there’s a reading error
      };

      reader.readAsDataURL(pdfFile); // Read the PDF file as a Data URL
    });
  }

  const blobToBase6 = (blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}


  const handleConvertPdfToImage = async () => {
    const imagesList = [];
    console.log({ pdfFile })
    const canvas = document.createElement("canvas");
    canvas.setAttribute("className", "canv");
    const data = await blobToBase6(pdfFile);
    console.log({ data })
    const pdf = await pdfjsLib.getDocument({ data }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      var page = await pdf.getPage(i);
      var viewport = page.getViewport({ scale: 1.5 });
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      var render_context = {
        canvasContext: canvas.getContext("2d"),
        viewport: viewport,
      };
      await page.render(render_context).promise;
      let img = canvas.toDataURL("image/png");
      imagesList.push(img);
    }
    console.log({ imagesList })
  }

  const handleImageConvert = async () => {
    // e.preventDefault()
    try {
      console.log({ pdfFileRef })
      // highresolution html2Canvas
      const output = await html2canvas(pdfFileRef.current, {
        type: 'dataURL',
        useCORS: false,
        removeContainer: true,
        logging: true,
        scale: 2,
        width: pdfFileRef.current?.offsetWidth,
        height: pdfFileRef.current?.offsetHeight,
        dpi: 600,
        allowTaint: true,
      })
      const base64Image = output?.toDataURL('image/png');
      setExtractedImage(base64Image)
    } catch (error) {
      console.log(error)
    }
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
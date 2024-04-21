import * as React from 'react'
import { PieChart, pieArcLabelClasses, pieArcClasses } from '@mui/x-charts/PieChart'
import { ThemeProvider, createTheme, styled } from '@mui/material/styles'
import TextField from '@mui/material/TextField'
import Button, { ButtonProps } from '@mui/material/Button'
import './App.css'

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
})

const GoldButton = styled(Button)<ButtonProps>(() => ({
  color: 'black',
  backgroundColor: '#EBB238',
  '&:hover': {
    backgroundColor: '#D4B065',
  },
}))

const App = () => {
  const minIncrements = 30
  const maxIncrements = 60
  const incrementsToVaryDelay = 12
  const initialDelay = 470
  const delayVariance = 35

  const [gameStarted, setGameStarted] = React.useState(false)
  const [questionsCount, setQuestionsCount] = React.useState<number>(12)
  const [questions, setQuestions] = React.useState<{
    label: string,
    value: 1,
    color?: string,
    answered?: boolean,
  }[]>([])
  const [questionsIndex, setQuestionsIndex] = React.useState(0)
  const [finalQuestionIndex, setFinalQuestionIndex] = React.useState<number | undefined>()
  const [spinning, setSpinning] = React.useState(false)
  const [text, setText] = React.useState("")

  const setupNewGame = () => {
    setQuestionsCount(12)
    setQuestions([])
    setGameStarted(false)
    setQuestionsIndex(0)
    setFinalQuestionIndex(undefined)
    setSpinning(false)
    setText("")
  }

  const startGame = () => {
    setQuestions(Array.from({ length: questionsCount }, (_, i) => ({
      label: `${i + 1}`,
      value: 1,
      color: i % 2 === 0 ? '#000000' : '#111111',
    })))
    setGameStarted(true)
  }

  const determineFinalQuestionIndex = (totalIncrements: number, previousFinalQuestionIndex?: number): number => {
    const questionIndex = typeof previousFinalQuestionIndex !== 'undefined'
      ? (totalIncrements + previousFinalQuestionIndex) % questions.length
      : (totalIncrements - 1) % questions.length
    return questionIndex === -1 ? questions.length - 1 : questionIndex
  }

  const spinQuestionWheel = (increments?: number, previousFinalQuestionIndex?: number) => {
    setSpinning(true)
    setText("")

    const updatedQuestions = [...questions]
    if (typeof finalQuestionIndex !== 'undefined') {
      updatedQuestions[finalQuestionIndex] = {
        ...updatedQuestions[finalQuestionIndex],
        color: '#756F61',
      }
      setQuestions(updatedQuestions)
    }

    const totalIncrements = typeof increments !== 'undefined'
      ? increments
      : Math.floor(Math.random() * (maxIncrements - minIncrements) + minIncrements)
    const determinedFinalQuestionIndex = determineFinalQuestionIndex(
      totalIncrements,
      typeof previousFinalQuestionIndex !== 'undefined' ? previousFinalQuestionIndex : finalQuestionIndex,
    )
    setFinalQuestionIndex(determinedFinalQuestionIndex)

    const incrementQuestionWheel = (delay: number, increment: number) => {
      setQuestionsIndex((questionsIndex) => (questionsIndex + 1) % questions.length)

      if (increment < totalIncrements) {
        setTimeout(
          incrementQuestionWheel,
          delay,
          increment < incrementsToVaryDelay
            ? delay - delayVariance
            : increment > totalIncrements - incrementsToVaryDelay
              ? delay + delayVariance
              : delay,
          increment + 1,
        )
      } else {
        if (questions[determinedFinalQuestionIndex].answered) {
          const currentQuestionsOrder = questions
            .slice(determinedFinalQuestionIndex, questions.length)
            .concat(questions.slice(0, determinedFinalQuestionIndex))
          const nextUnansweredQuestionIdx = currentQuestionsOrder.findIndex((question) => !question.answered)

          if (nextUnansweredQuestionIdx > 0) {
            setText(`You landed on question ${questions[determinedFinalQuestionIndex].label}, but you've already answered that question...`)
            setTimeout(() => spinQuestionWheel(nextUnansweredQuestionIdx, determinedFinalQuestionIndex), 2000)
          }
        } else {
          updatedQuestions[determinedFinalQuestionIndex] = {
            ...updatedQuestions[determinedFinalQuestionIndex],
            answered: true,
            color: '#EBB238',
          }
          const allQuestionsAnswered = updatedQuestions.every((question) => question.answered)
          setText(`${increments ? "Now, you" : "You"} landed on question ${updatedQuestions[determinedFinalQuestionIndex].label}${allQuestionsAnswered ? ". That's the last question - thanks for playing!" : "!"}`)
          setQuestions(updatedQuestions)
          setSpinning(allQuestionsAnswered)
        }
      }
    }
    incrementQuestionWheel(initialDelay, 1)
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <header 
        style={{
          position: 'fixed',
          top: '0px',
          left: '0px',
          height: '90px',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          fontSize: 32,
          backgroundColor: '#AB0309',
        }}>
        <span>Что? Где? Когда?</span>
        <span style={{ fontSize: 16 }}>What? Where? When?</span>
      </header>
      <main>
      {gameStarted ? (
        <>
          <GoldButton
            variant="contained"
            size="large"
            disabled={spinning}
            onClick={() => spinQuestionWheel()}
          >
            Spin!
          </GoldButton>
          <p style={{ height: '20px'}}>{text}</p>
    
          <div style={{ position: 'relative', width: '500px', height: '500px', paddingLeft: '90px', marginBottom: '20px' }}>
            <img
              src="middle-of-wheel.png"
              alt="Middle of What Where When wheel"
              height="100px"
              width="100px"
              style={{ position: 'absolute', left: '243px', top: '200px', zIndex: 100 }}
            />
            <div
              style={{
                width: '25px',
                height: '200px',
                position: 'absolute',
                left: '266px',
                top: '50px',
                zIndex: 100,
                background: 'linear-gradient(to top right, rgba(190,6,12,0) 0%, rgba(190,6,12,0) calc(50% - 3px), rgba(190,6,12,1) 50%, rgba(190,6,12,0) calc(50% + 3px), rgba(190,6,12,0) 100%)'
              }}
            />
            
            <PieChart
              slotProps={{ legend: { hidden: true } }}
              tooltip={{ slotProps: { popper: { hidden: true } }}}
              width={500}
              height={500}
              series={[
                {
                  data: questions
                    .slice(questionsIndex, questions.length)
                    .concat(questions.slice(0, questionsIndex)),
                  arcLabel: (params) => params.label ?? '',
                  innerRadius: 50,
                },
              ]}
              sx={{
                [`& .${pieArcLabelClasses.root}`]: {
                  fill: 'red',
                  fontSize: 20,
                  fontWeight: 600,
                  textShadow: '0.5px 0.5px white, -0.5px 0.5px white, 0.5px -0.5px white, -0.5px -0.5px white',
                },
                [`& .${pieArcClasses.root}`]: {
                  stroke: '#D4B065',
                  strokeWidth: '1.5px',
                },
              }}
            />
          </div>

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => setupNewGame()}
          >
            New game
          </Button>
        </>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', rowGap: '40px' }}>
          <span style={{ fontSize: 20 }}>How many questions do you have prepared?</span>
          <div style={{ display: 'flex', alignItems: 'baseline', columnGap: '30px' }}>
            <TextField
              id="questions-input"
              value={questionsCount}
              error={!questionsCount || questionsCount < 2 || questionsCount > 30}
              helperText="Enter a number between 2 and 30"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setQuestionsCount(parseInt(event.target.value) || 0)
              }}
            />
            <GoldButton
              variant="contained"
              disabled={!questionsCount || questionsCount < 2 || questionsCount > 30}
              onClick={startGame}
              style={{ height: '40px'}}
            >
              Start game
            </GoldButton>
          </div>
        </div>
      )}
      </main>
    </ThemeProvider>
  )
}

export default App

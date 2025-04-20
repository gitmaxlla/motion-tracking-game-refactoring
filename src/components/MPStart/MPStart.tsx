// REF: MPStart - назначение файла сразу не понять. Может переименовать, переместить в App т. д.?
// NITPICK: много импортов, мало переносов строк
import { useRef, useEffect, useState } from 'react'
import Webcam from 'react-webcam'
import {
  Holistic,
  Results,
  POSE_CONNECTIONS,
  HAND_CONNECTIONS,
} from '@mediapipe/holistic'
import { drawConnectors, drawLandmarks } from '@mediapipe/drawing_utils'
import { Camera } from '@mediapipe/camera_utils'

import styles from './MPStart.module.css'
import ImageOfPose from '../ImageOfPose/ImageOfPose'
import {
  idlePose,
  removeTiedownsPose1,
  removeTiedownsPose2,
  removeTiedownsPose3,
  removeTiedownsPose4,
  tiedownsRemovedPose1,
  tiedownsRemovedPose2,
  tiedownsRemovedPose3,
  tiedownsRemovedPose4,
  wheelChocksRemovedPose,
  moveAheadPose,
  turnRightPose,
  turnLeftPose,
  stopPose,
  unfoldWingsPose1,
  unfoldWingsPose2,
  launchBarPose1,
  launchBarPose2,
} from '../../pose_predicate'
import {
  TRAINING_GAME_MODE,
  NOT_TRAINING_GAME_MODE,
} from '../../store/slices/gameLogicSlice'
import { changeGameMode } from '../../store/slices/gameLogicSlice'
import { toNextLevel, restart } from '../../store/slices/trainingModeSlice'
import { useStoreDispatch, useStoreSelector } from '../../store/hooks'

const MPStart = () => {
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // REF: isEverythingSeen или всё-таки wholePoseDetected/allDetected (или как-то иначе)
  const [isEverythingSeen, setIsEverythingSeen] = useState(false)

  const dispatch = useStoreDispatch()
  const gameMode = useStoreSelector((state) => state.gameLogic.gameMode)

  const { level, trainingMessage } = useStoreSelector(
    (state) => state.trainingMode,
  )

  const notTrainingRef = useRef<{
    pose: string | null
    count: number
  }>({ pose: null, count: 0 })
  const [notTrainingMessage, setNotTrainingMessage] = useState('unknown')

  const holisticRef = useRef<Holistic | null>(null)
  const cameraRef = useRef<Camera | null>(null)

  useEffect(() => {
    // REF: смысл условия? notInitialized()? Вынести в функцию;
    //      в целом этот useEffect большой и не совсем понятно изначально для чего (может лямбду вынести в функцию?);
    //      setupMediapipeSolution()?
    if (holisticRef.current === null || cameraRef.current === null) {
      holisticRef.current = new Holistic({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
      })

      holisticRef.current.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      })

      // REF: setupCameraFeed()?
      if (webcamRef.current?.video) {
        cameraRef.current = new Camera(webcamRef.current.video, {
          onFrame: async () => {
            await holisticRef.current!.send({
              image: webcamRef.current!.video!,
            })
          },
        })
        cameraRef.current.start()
      }
    }

    return () => {
      cameraRef.current?.stop()
      holisticRef.current?.close()
    }
  }, [])

  // REF: Опять же, может вынести функцию и назвать её как-нибудь осмысленно?
  useEffect(() => {
    // REF: .onResults(onResults) не добавляет никакой смысловой нагрузки;
    //      хотя бы onResults -> onNewPose?
    const onResults = (results: Results) => {
      // REF: Вынести в функцию
      if (!canvasRef.current || !webcamRef.current?.video) return

      const videoW = webcamRef.current.video.videoWidth
      const videoH = webcamRef.current.video.videoHeight
      canvasRef.current.width = videoW
      canvasRef.current.height = videoH

      const canvasCtx = canvasRef.current.getContext('2d')
      if (!canvasCtx) return

      // NITPICK: здесь и далее вероятно вполне хватит одной строки
      //          для указания параметров вместо четырёх / пяти
      canvasCtx.save()
      canvasCtx.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      )
      canvasCtx.drawImage(
        results.image,
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height,
      )

      // REF: в чём смысл существования переменной? poseDetected()?
      if (results.poseLandmarks) {
        // REF: drawEstimatedPose()? 
        //      -> drawHand(leftHandLandmarks), drawHand(rightHandLandmarks), drawBody()?
        //      абстракцию ввести бы здесь в общем-то
        drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
          color: 'white',
          lineWidth: 3,
        })
        drawLandmarks(canvasCtx, results.poseLandmarks, {
          color: 'black',
          fillColor: 'rgb(225, 255, 0)',
          lineWidth: 1.5,
        })
        drawConnectors(canvasCtx, results.leftHandLandmarks, HAND_CONNECTIONS, {
          color: 'rgb(255, 85, 85)',
          lineWidth: 2.5,
        })
        drawLandmarks(canvasCtx, results.leftHandLandmarks, {
          color: 'white',
          fillColor: 'red',
          lineWidth: 1,
          radius: 4,
        })
        drawConnectors(
          canvasCtx,
          results.rightHandLandmarks,
          HAND_CONNECTIONS,
          {
            color: 'rgb(76, 85, 255)',
            lineWidth: 2.5,
          },
        )
        drawLandmarks(canvasCtx, results.rightHandLandmarks, {
          color: 'white',
          fillColor: 'blue',
          lineWidth: 1,
          radius: 4,
        })
      }

      // REF: объявление функции gotoNextLevelFrom переместить к началу processTraining 
      //      posePredicate -> poseDetected()? 
      //      много дублирования, следует обернуть в forEach() 
      //      goToNextLevelFrom -> nextLevelIfPoseAtLevel?
      //      fromLevel -> from / at (и так LevelFrom / AtLevel)? [больше NITPICK] 
      //      processTraning -> proceedTraining (будто звучит понятнее)?
      function processTraining(results: Results) {
        goToNextLevelFrom(0, idlePose)
        goToNextLevelFrom(1, removeTiedownsPose1)
        goToNextLevelFrom(2, removeTiedownsPose2)
        goToNextLevelFrom(3, removeTiedownsPose3)
        goToNextLevelFrom(4, removeTiedownsPose4)
        goToNextLevelFrom(5, idlePose)
        goToNextLevelFrom(6, tiedownsRemovedPose1)
        goToNextLevelFrom(7, tiedownsRemovedPose2)
        goToNextLevelFrom(8, tiedownsRemovedPose3)
        goToNextLevelFrom(9, tiedownsRemovedPose4)
        goToNextLevelFrom(10, idlePose)
        goToNextLevelFrom(11, wheelChocksRemovedPose)
        goToNextLevelFrom(12, idlePose)
        goToNextLevelFrom(13, moveAheadPose)
        goToNextLevelFrom(14, idlePose)
        goToNextLevelFrom(15, turnRightPose)
        goToNextLevelFrom(16, idlePose)
        goToNextLevelFrom(17, turnLeftPose)
        goToNextLevelFrom(18, idlePose)
        goToNextLevelFrom(19, stopPose)
        goToNextLevelFrom(20, idlePose)
        goToNextLevelFrom(21, unfoldWingsPose1)
        goToNextLevelFrom(22, unfoldWingsPose2)
        goToNextLevelFrom(23, idlePose)
        goToNextLevelFrom(24, launchBarPose1)
        goToNextLevelFrom(25, launchBarPose2)
        goToNextLevelFrom(26, idlePose)
        goToNextLevelFrom(27, launchBarPose2)
        goToNextLevelFrom(28, launchBarPose1)
        goToNextLevelFrom(29, idlePose)
        function goToNextLevelFrom(
          fromLevel: number,
          posePredicate: (results: Results) => boolean,
        ) {
          if (level === fromLevel && posePredicate(results)) {
            dispatch(toNextLevel())
            // REF: нужен ли return? Если это неочевидно даже для знающих фреймворк, закомментировать, иначе 
            //      оставить как есть
            return
          }
        }
      }

      // REF: не лучше ли обернуть обе функции под полиморфизм? 
      //      напр. traning.proceed(results);
      //      мало деления на блоки переносами строк (не только здесь)
      function processNotTraining(results: Results) {
        function processPose(
          results: Results,
          poseName: string,
          posePredicate: (results: Results) => boolean,
        ): boolean {
          // NOTE: сказанное о функции выше распространяется и здесь
          if (posePredicate(results)) {
            // REF: больше функций? 
            //      switchPose(name), countTowards(poseName)...
            if (notTrainingRef.current.pose === poseName)
              notTrainingRef.current.count += 1
            else notTrainingRef.current.count = 0
            // NOTE: излишнее присвоение? точно ли не принадлежит к else выше?
            notTrainingRef.current.pose = poseName
            console.log(`${poseName} ${notTrainingRef.current.count}`)
            return true
          }
          return false
        }

        processPose(results, 'idle', idlePose)

        // REF: достаточно просто unfoldWingsDetected
        const unfoldWingsIsDetected = processPose(
          results,
          'wheelChocksRemoved',
          wheelChocksRemovedPose,
        )
        // REF: новая строка 
        if (!unfoldWingsIsDetected) {
          processPose(results, 'moveAhead', moveAheadPose)
        }

        // REF: Magic Number -> 20 заменить константой
        if (notTrainingRef.current.count >= 20) {
          console.log('aaaaa eto ' + notTrainingRef.current.pose)
          notTrainingRef.current.count = 0
          if (notTrainingRef.current.pose)
            setNotTrainingMessage(notTrainingRef.current.pose)
        }
      }

      // NITPICK: && читаемее поставить на новой строке, как и
      //          ||
      // REF: что вообще означает это условие?
      if (
        results.poseLandmarks &&
        (results.rightHandLandmarks || results.leftHandLandmarks)
      ) {
        setIsEverythingSeen(true)
        // REF: эта проблема уже описывалось в gameLogicSlice 
        //      (кстати, почти что дублирующийся код между двумя файлами)
        switch (gameMode) {
          case TRAINING_GAME_MODE:
            processTraining(results)
            break
          case NOT_TRAINING_GAME_MODE:
            processNotTraining(results)
            break
        }
      } else {
        setIsEverythingSeen(false)
      }

      canvasCtx.restore()
    }

    // NOTE: разве нельзя просто holisticRef.current?.onResults(...)
    if (holisticRef.current) holisticRef.current.onResults(onResults)
  }, [dispatch, gameMode, level])

  const handleGameModeButtonClick = () => {
    dispatch(changeGameMode())
  }

  const handleRestartButtonClick = () => {
    dispatch(restart())
  }

  return (
    <div className={styles.mpstart}>
      <h1>{gameMode}</h1>
      <button onClick={handleGameModeButtonClick}>another game mode</button>
      <p className={styles.message}>
        {gameMode === TRAINING_GAME_MODE ? trainingMessage : notTrainingMessage}
      </p>
      {gameMode === TRAINING_GAME_MODE && (
        <button onClick={handleRestartButtonClick}>RESTART</button>
      )}
      <div className={styles.canvasAndImage}>
        <canvas
          className={styles.canvas}
          style={{
            boxShadow: isEverythingSeen
              ? '0px 0px 20px 5px rgba(13, 232, 31, 0.5)'
              : '0px 0px 20px 5px rgba(255, 50, 50, 0.5)',
          }}
          ref={canvasRef}
        >
          <Webcam audio={false} ref={webcamRef} />
        </canvas>
        {gameMode === TRAINING_GAME_MODE && <ImageOfPose />}
      </div>
    </div>
  )
}

export default MPStart

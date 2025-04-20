import { POSE_LANDMARKS, Results } from '@mediapipe/holistic'

import areCoordsClose from './areCoordsClose'

export const idlePose = ({
  poseLandmarks,
}: Pick<Results, 'poseLandmarks'>): boolean => {
  const shoulderR = poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const elbowR = poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW]
  const wristR = poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST]

  const shoulderL = poseLandmarks[POSE_LANDMARKS.LEFT_SHOULDER]
  const elbowL = poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW]
  const wristL = poseLandmarks[POSE_LANDMARKS.LEFT_WRIST]

  // REF: в rightSide и leftSide дублируется функционал, 
  //      отличия лишь в передаваемых параметрах -> новая функция
  const rightSide =
    areCoordsClose(shoulderR.x, elbowR.x) &&
    areCoordsClose(shoulderR.x, wristR.x) &&
    shoulderR.y < elbowR.y &&
    elbowR.y < wristR.y

  const leftSide =
    areCoordsClose(shoulderL.x, elbowL.x) &&
    areCoordsClose(shoulderL.x, wristL.x) &&
    shoulderL.y < elbowL.y &&
    elbowL.y < wristL.y

  return rightSide && leftSide
}

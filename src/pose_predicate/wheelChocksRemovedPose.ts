import { POSE_LANDMARKS, Results } from '@mediapipe/holistic'

import areCoordClose from './areCoordsClose'

export const wheelChocksRemovedPose = ({
  poseLandmarks,
  rightHandLandmarks,
  leftHandLandmarks,
}: Pick<
  Results,
  'poseLandmarks' | 'rightHandLandmarks' | 'leftHandLandmarks'
>): boolean => {
  // REF: handsNotDetected()
  if (!rightHandLandmarks || !leftHandLandmarks) return false

  const nose = poseLandmarks[POSE_LANDMARKS.NOSE]

  const shoulderR = poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const elbowR = poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW]
  const wristR = poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST]
  const thumbTipR = rightHandLandmarks[4]
  const indexTipR = rightHandLandmarks[8]
  const middleTipR = rightHandLandmarks[12]
  const ringTipR = rightHandLandmarks[16]
  const pinkyTipR = rightHandLandmarks[20]
  const indexMcpR = rightHandLandmarks[5]
  const middleMcpR = rightHandLandmarks[9]
  const ringMcpR = rightHandLandmarks[13]
  const pinkyMcpR = rightHandLandmarks[17]

  const shoulderL = poseLandmarks[POSE_LANDMARKS.LEFT_SHOULDER]
  const elbowL = poseLandmarks[POSE_LANDMARKS.LEFT_ELBOW]
  const wristL = poseLandmarks[POSE_LANDMARKS.LEFT_WRIST]
  const thumbTipL = leftHandLandmarks[4]
  const indexTipL = leftHandLandmarks[8]
  const middleTipL = leftHandLandmarks[12]
  const ringTipL = leftHandLandmarks[16]
  const pinkyTipL = leftHandLandmarks[20]
  const indexMcpL = leftHandLandmarks[5]
  const middleMcpL = leftHandLandmarks[9]
  const ringMcpL = leftHandLandmarks[13]
  const pinkyMcpL = leftHandLandmarks[17]

  // REF: lowerThan, higherThan, outsideOf, insideOf, closeToEachOther
  const rightSide =
    wristR.y < nose.y &&
    shoulderR.x > elbowR.x &&
    elbowR.x > thumbTipR.x &&
    areCoordClose(elbowR.x, wristR.x) &&
    indexMcpR.y < indexTipR.y &&
    middleMcpR.y < middleTipR.y &&
    ringMcpR.y < ringTipR.y &&
    pinkyMcpR.y < pinkyTipR.y

  const leftSide =
    wristL.y < nose.y &&
    elbowL.x > shoulderL.x &&
    thumbTipL.x > elbowL.x &&
    areCoordClose(elbowL.x, wristL.x) &&
    indexMcpL.y < indexTipL.y &&
    middleMcpL.y < middleTipL.y &&
    ringMcpL.y < ringTipL.y &&
    pinkyMcpL.y < pinkyTipL.y

  return rightSide && leftSide
}

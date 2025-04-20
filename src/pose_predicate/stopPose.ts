import { POSE_LANDMARKS, Results } from '@mediapipe/holistic'

export const stopPose = ({
  poseLandmarks,
  rightHandLandmarks,
  leftHandLandmarks,
}: Pick<
  Results,
  'poseLandmarks' | 'rightHandLandmarks' | 'leftHandLandmarks'
>): boolean => {
  if (!rightHandLandmarks || !leftHandLandmarks) return false

  // REF: отличный пример того большого списка параметров, который нужно
  //      вынести в функции в файле Landmark (смотреть файл ref-notes)
  const nose = poseLandmarks[POSE_LANDMARKS.NOSE]

  const shoulderR = poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const elbowR = poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW]
  const wristR = poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST]
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
  const indexTipL = leftHandLandmarks[8]
  const middleTipL = leftHandLandmarks[12]
  const ringTipL = leftHandLandmarks[16]
  const pinkyTipL = leftHandLandmarks[20]
  const indexMcpL = leftHandLandmarks[5]
  const middleMcpL = leftHandLandmarks[9]
  const ringMcpL = leftHandLandmarks[13]
  const pinkyMcpL = leftHandLandmarks[17]

  // REF: boolean назван существительным, а не предикатом 
  //      (rightSideArm -> rightArmInRightPos) и т. д. 
  const rightSideArm = wristR.y < nose.y && shoulderR.y >= elbowR.y

  const leftSideArm = wristL.y < nose.y && shoulderL.y >= elbowL.y

  // REF: хотелось бы увидеть особый метод McpLowerThanTip()
  //      и итерацию по всем массивам частей пальцев
  const rightFist =
    indexMcpR.y < indexTipR.y &&
    middleMcpR.y < middleTipR.y &&
    ringMcpR.y < ringTipR.y &&
    pinkyMcpR.y < pinkyTipR.y

  const leftFist =
    indexMcpL.y < indexTipL.y &&
    middleMcpL.y < middleTipL.y &&
    ringMcpL.y < ringTipL.y &&
    pinkyMcpL.y < pinkyTipL.y

  return rightSideArm && leftSideArm && rightFist && leftFist
}

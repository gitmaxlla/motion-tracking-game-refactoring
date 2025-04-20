import { POSE_LANDMARKS, Results } from '@mediapipe/holistic'

import areCoordsClose from './areCoordsClose'

export const launchBarPose1 = ({
  poseLandmarks,
}: Pick<Results, 'poseLandmarks'>): boolean => {
  const shoulderR = poseLandmarks[POSE_LANDMARKS.RIGHT_SHOULDER]
  const elbowR = poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW]
  const wristR = poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST]

  const wristL = poseLandmarks[POSE_LANDMARKS.LEFT_WRIST]

  const leftWristOnRightElbow =
    areCoordsClose(wristL.x, elbowR.x) && areCoordsClose(wristL.y, elbowR.y)

  const rightWristRightElbowOnVertLine = areCoordsClose(wristR.x, elbowR.x)

  const rightWristHigherThanRightShoulder = wristR.y < shoulderR.y

  return (
    leftWristOnRightElbow &&
    rightWristRightElbowOnVertLine &&
    rightWristHigherThanRightShoulder
  )
}

export const launchBarPose2 = ({
  poseLandmarks,
}: Pick<Results, 'poseLandmarks'>): boolean => {
  const elbowR = poseLandmarks[POSE_LANDMARKS.RIGHT_ELBOW]
  const wristR = poseLandmarks[POSE_LANDMARKS.RIGHT_WRIST]

  const wristL = poseLandmarks[POSE_LANDMARKS.LEFT_WRIST]

  // REF: один из примеров дублирующегося шаблона вычисления 
  //      - подобное есть в tiedownsRemovedPoses
  const leftWristOnRightElbow =
    areCoordsClose(wristL.x, elbowR.x) && areCoordsClose(wristL.y, elbowR.y)

  const rightWristRightElbowOnHorizLine = areCoordsClose(wristR.y, elbowR.y)

  return leftWristOnRightElbow && rightWristRightElbowOnHorizLine
}

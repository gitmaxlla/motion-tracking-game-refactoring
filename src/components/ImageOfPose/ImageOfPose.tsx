import { useStoreSelector } from '../../store/hooks'
import { levelsData } from '../../store/slices/trainingModeSlice'


// NITPICK: poseImage звучит проще?
const ImageOfPose = () => {
  const level = useStoreSelector((state) => state.trainingMode.level)

  return (
    <img src={levelsData[level][1]} alt="pose" style={{ height: '480px' }} />
  )
}

export default ImageOfPose

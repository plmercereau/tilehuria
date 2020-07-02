import { receiveAoi } from './server'
const main = async () => {
  try {
    await receiveAoi()
    console.log(' [*] Worker service started')
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}
main()

import { start } from './server'
import { connectQueues } from './queue'

const main = async () => {
  try {
    await connectQueues()
    await start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()

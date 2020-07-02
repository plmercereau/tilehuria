import { start } from './server'
import { connect } from './queue'

const main = async () => {
  try {
    await connect()
    await start()
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

main()

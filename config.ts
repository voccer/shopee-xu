import { config } from 'dotenv'
import path from 'path'

const envPath = path.join(__dirname, '.env')

config({ path: envPath })

class Config {
  static browserConfig() {
    return {
      headless: process.env.BROWSER_HEADLESS_MODE === 'true' || false
    }
  }

  static accountConfig() {
    return {
      usernames: process.env.USERNAMES,
      passwords: process.env.PASSWORDS
    }
  }
}

export default Config

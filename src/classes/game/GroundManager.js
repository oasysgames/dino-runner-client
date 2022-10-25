import * as constants from "../../constants.js"

export default class GroundManager {
  constructor(runnerScene, player) {
    this.runnerScene = runnerScene
    this.player = player
    this.platforms
    this.activePlatforms = []

    this.spawnPlatformTrigger = constants.GROUND.IMAGE_LENGTH / 2
    this.platformCounter = 0

    this.initGround()
  }

  // Initialize first two platforms
  initGround = () => {
    this.platforms = this.runnerScene.physics.add.staticGroup()

    // Start out with 2 platforms
    this.createPlatform()
    this.createPlatform()
  }

  // Seemlessly create next platform
  createPlatform = () => {
    const posX = constants.GROUND.FIRST_PLATFORM_POS + this.platformCounter * constants.GROUND.IMAGE_LENGTH
    const ground = this.platforms.create(posX, constants.GROUND.Y_POS, 'ground')
    this.platformCounter++
    this.activePlatforms.push(ground)

    return ground
  }

  // Clear the earliest platform when over max instances
  clearPlatform = () => {
    if(this.activePlatforms.length >= constants.GROUND.MAX_INSTANCE_AMOUNT) {
      const platform = this.activePlatforms[0]

      platform.destroy()
      this.activePlatforms.shift()
    }
  }

  // Check player xPos on update to spawn and clean up platforms if needed
  update() {
    if(this.player.x >= this.spawnPlatformTrigger) {
      this.spawnPlatformTrigger += constants.GROUND.IMAGE_LENGTH
      this.createPlatform()
      this.clearPlatform()
    }
  }
}
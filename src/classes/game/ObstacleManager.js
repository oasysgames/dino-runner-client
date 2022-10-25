import * as utils from "../../utils.js"
import * as constants from "../../constants.js"
import { web3Connection } from "../../index.js"

export default class ObstacleManager {
  constructor(runnerScene, player, obstacleSprite) {
    this.runnerScene = runnerScene
    this.player = player
    this.selectedObstacleSprite = obstacleSprite
    this.obstacles
    this.activeObstacles = []
    this.hardObstacleSpawnChance = constants.OBSTACLES.HARD_SPAWN_CHANCE_BASE
    this.spawnObstacleTrigger = constants.OBSTACLES.FIRST_SPAWN_POSITION
  
    this.initObstacles()
  }

  // Prepare obstacle collision group
  initObstacles = () => {
    this.obstacles = this.runnerScene.physics.add.staticGroup()
  }

  // Create new obstacle at passed x position
  createObstacle = (posX) => {
    let obstacleType
    let props = {}

    if(this.selectedObstacleSprite === 'rockTall') {
      // Select any of default rocks if no custom art is selected
      const rand =  utils.randomNumInRange(1, 100)
      if(rand < this.hardObstacleSpawnChance / 2) {
        obstacleType = 'rockWide'
        props = {posY: 572, sizeX: 200, sizeY: 100, offsetX: 20, offsetY: 28}
      } else if(rand < this.hardObstacleSpawnChance) {
        obstacleType = 'rockDuo'
        props = {posY: 570, sizeX: 160, sizeY: 110, offsetX: 0, offsetY: 22}
      } else {
        obstacleType = 'rockTall'
        props = {posY: 586, sizeX: 80, sizeY: 90, offsetX: 0, offsetY: 10}
      }  
    } else {
      // Select random image from registered art if randomAll is selected
      if(this.selectedObstacleSprite === 'randomAll') {
        const obstacleArts = utils.getSavedArtsForType("obstacles")
        const rand = Math.floor(Math.random() * obstacleArts.length)
        obstacleType = obstacleArts[rand].imageLink
      } else {
        obstacleType = this.selectedObstacleSprite
      }

      // Need this to move collision to ground level
      const texture = this.runnerScene.textures.get(obstacleType)
      const scale = utils.getIdealSpriteScale(texture, true)
      const offset = texture.getSourceImage().height * scale / 2
      props = {posY: 636 - offset}      
    }
  
    // Move spawn trigger to next position
    this.spawnObstacleTrigger = posX
    const obstacle = this.obstacles.create(posX, props.posY, obstacleType)

    // Adjust size, scale and offsets depending on obstacle type
    if(this.selectedObstacleSprite === 'rockTall') {
      obstacle.setSize(props.sizeX, props.sizeY, 0, 0)
      obstacle.setOffset(props.offsetX, props.offsetY)  
    } else {
      const texture = this.runnerScene.textures.get(obstacleType)
      const scale = utils.getIdealSpriteScale(texture, true)
      obstacle.setSize(texture.getSourceImage().width * scale, texture.getSourceImage().height * scale)
      obstacle.setScale(scale)
      obstacle.setOrigin(0.5, 0.5)
    }

    this.activeObstacles.push(obstacle)
    this.clearObstacle()
    return obstacle
  }
  
  // Remove first obstacle if over instance limit
  clearObstacle = () => {
    if(this.activeObstacles.length >= constants.OBSTACLES.MAX_INSTANCES) {
      this.activeObstacles[0].destroy()
      this.activeObstacles.shift()
    }
  }

  // Set difficulty to next level
  increaseDifficulty = () => {
    this.hardObstacleSpawnChance = Math.min(
      this.hardObstacleSpawnChance + constants.OBSTACLES.hardObstacleSpawnChanceStep,
      constants.OBSTACLES.HARD_SPAWN_CHANCE_MAX
    )
  }

  // Check for player position on update to determine if new Obstacle should spawn
  update() {
    if(this.player.x >= this.spawnObstacleTrigger) {
      const min = this.spawnObstacleTrigger - constants.OBSTACLES.POS_TOLERANCE_MIN
      const position = utils.randomNumInRange(this.spawnObstacleTrigger + constants.OBSTACLES.POS_TOLERANCE_MAX, min)
      this.createObstacle(position + constants.GROUND.IMAGE_LENGTH)
    }
  }
}
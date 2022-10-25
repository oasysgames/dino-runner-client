import * as utils from "../../utils.js"
import * as constants from "../../constants.js"
import { web3Connection } from "../../index.js"

export default class EnvironmentManager {
  constructor(runnerScene, player, cloudSprite) {
    this.runnerScene = runnerScene
    this.player = player
    this.background
    this.cloudSprite = cloudSprite

    // Save state of parallax scrolling images
    this.parallax = {
      cloudLayer: {
        scrollSpeed: constants.ENVIRONMENT.CLOUD_LAYER_SCROLL_SPEED,
        activeItems: [],
        count: 0,
        updateTrigger: 0,
      },
      backLayer: {
        scrollSpeed: constants.ENVIRONMENT.BACK_LAYER_SCROLL_SPEED,
        activeItems: [],
        count: 0,
        updateTrigger: 0,
      },
      frontClouds: {
        scrollSpeed: constants.ENVIRONMENT.FRONT_CLOUDS.SCROLL_SPEED,
        activeItems: [],
        textureLength: 0,
      }
    }

    this.initEnvironment()
  }

  // Initialize all environment related objects
  initEnvironment = () => {
    this.setBackgroundImage()
    this.saveCloudLength()
    this.initParallaxBg()
    this.createCloud()
  }

  // Place background in the center and prevent scrolling
  setBackgroundImage = () => {
    this.background = this.runnerScene.add.image(constants.GAME.CANVAS_WIDTH / 2, constants.GAME.CANVAS_HEIGHT / 2, 'background')
    this.background.setScrollFactor(0)
  }

  // Create the next sprite for any parallax image
  createAlignedSprite = (texture) => {
    const posX = this.parallax[texture].count * constants.GAME.CANVAS_WIDTH
    this.parallax[texture].updateTrigger = posX - constants.GAME.CANVAS_WIDTH
    this.parallax[texture].count++
  
    // Shift last item over instead of creating new one if max items reached
    if(this.parallax[texture].activeItems.length >= constants.ENVIRONMENT.PARALLAX_INSTANCE_MAX) {
      this.parallax[texture].activeItems[0].x = posX
      this.parallax[texture].activeItems.push(this.parallax[texture].activeItems.shift())
    } else {
      const item = this.runnerScene.add.image(posX, constants.GAME.CANVAS_HEIGHT, texture).setOrigin(0, 1)
      item.setScrollFactor(this.parallax[texture].scrollSpeed)
      this.parallax[texture].activeItems.push(item)
    }
  }

  // Initialize scrolling cloud and back layer
  initParallaxBg = () => {
    for(let i = 0; i < constants.ENVIRONMENT.PARALLAX_INSTANCE_MAX; i++) {
      this.createAlignedSprite('cloudLayer')
      this.createAlignedSprite('backLayer')
    }
  }

  // Store length of cloud image for later use
  saveCloudLength = () => {
    this.parallax.frontClouds.textureLength = this.runnerScene.textures.get('cloud').getSourceImage().width
  }

  // Create new cloud in the foreground
  createCloud = () => {
    let cloudSprite = this.cloudSprite

    // Pick random sprite if randomAll selected
    if(cloudSprite === "randomAll") {
      const cloudArts = utils.getSavedArtsForType("clouds")
      const rnd = Math.floor(Math.random() * cloudArts.length)
      cloudSprite = cloudArts[rnd].imageLink
    }

    const posX = this.player.x * this.parallax.frontClouds.scrollSpeed +
                 constants.GAME.CANVAS_WIDTH + this.parallax.frontClouds.textureLength
                 
    const posY = utils.randomNumInRange(
      constants.ENVIRONMENT.FRONT_CLOUDS.Y_POS_MIN,
      constants.ENVIRONMENT.FRONT_CLOUDS.Y_POS_MAX
    )
  
    let cloud
    if(cloudSprite === "randomAll") {
      // Create new cloud and delete last one each time
      const scale = utils.getIdealSpriteScale(this.runnerScene.textures.get(cloudSprite), false)
      cloud = this.runnerScene.add.image(posX, posY, cloudSprite)
      cloud.setScale(scale)
      this.parallax.frontClouds.activeItems.push(cloud)
      if(this.parallax.frontClouds.activeItems.length >= constants.ENVIRONMENT.PARALLAX_INSTANCE_MAX) {
        const firstCloud = this.parallax.frontClouds.activeItems[0]
        firstCloud.destroy()
        this.parallax.frontClouds.activeItems.shift()
      }
    } else {
      // Reuse clouds if at max, otherwise create new
      if(this.parallax.frontClouds.activeItems.length >= constants.ENVIRONMENT.PARALLAX_INSTANCE_MAX) {
        cloud = this.parallax.frontClouds.activeItems[0]
        cloud.x = posX
        cloud.y = posY
        this.parallax.frontClouds.activeItems.push(this.parallax.frontClouds.activeItems.shift())
      } else {
        const scale = utils.getIdealSpriteScale(this.runnerScene.textures.get(cloudSprite), false)
        cloud = this.runnerScene.add.image(posX, posY, cloudSprite)
        cloud.setScale(scale)
        this.parallax.frontClouds.activeItems.push(cloud)
      }  
    }
  
    cloud.alpha = 0.8
    cloud.setScrollFactor(this.parallax.frontClouds.scrollSpeed)
  
    // Call self again with random delay to loop
    const spawnDelay = utils.randomNumInRange(
      constants.ENVIRONMENT.FRONT_CLOUDS.MIN_SPAWN_DELAY,
      constants.ENVIRONMENT.FRONT_CLOUDS.MAX_SPAWN_DELAY
    )
    this.runnerScene.time.delayedCall(spawnDelay, this.createCloud)

    return cloud
  }

  // Check for player x pos on update and create new parallax item if needed
  update() {
    if((this.player.x - constants.GAME.START_POS) * this.parallax.cloudLayer.scrollSpeed >= this.parallax.cloudLayer.updateTrigger) {
      this.createAlignedSprite('cloudLayer')
    }
  
    if((this.player.x - constants.GAME.START_POS) * this.parallax.backLayer.scrollSpeed >= this.parallax.backLayer.updateTrigger) {
      this.createAlignedSprite('backLayer')
    }
  }
}
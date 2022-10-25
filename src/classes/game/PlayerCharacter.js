import * as constants from "../../constants.js"
import * as utils from "../../utils.js"

export default class PlayerCharacter {
  constructor(runnerScene, audioRefs, spriteType = 'dino') {
    this.runnerScene = runnerScene
    this.audioRefs = audioRefs
    this.runSpeed = constants.PLAYER.BASE_RUN_SPEED
    this.sprite

    // Set spriteType to 'dino' if no custom art selected
    this.spriteType = 
      spriteType === 'pixelDinoGreen' ||
      spriteType === 'pixelDinoBlue' ||
      spriteType === 'pixelDinoRed' ?
      'dino' : spriteType
  
    this.initPlayer()
  }

  // Init animations and player base settings
  initPlayer = () => {
    if(this.spriteType === 'dino') {
      // Set up collision
      this.sprite = this.runnerScene.physics.add.sprite(constants.GAME.START_POS, constants.GAME.START_HEIGHT, this.spriteType)
      this.sprite.body.setSize(50, 90, 0, 0)
      this.sprite.body.setOffset(25, 0)
    
      // Only add animations for default dino characters
      this.runnerScene.anims.create({
        key: 'run',
        frames: this.runnerScene.anims.generateFrameNumbers(this.spriteType, { start: 1, end: 2 }),
        frameRate: 10,
        repeat: -1
      })
    
      this.runnerScene.anims.create({
        key: 'runFast',
        frames: this.runnerScene.anims.generateFrameNumbers(this.spriteType, { start: 1, end: 2 }),
        frameRate: 15,
        repeat: -1
      })
  
      this.runnerScene.anims.create({
        key: 'die',
        frames: this.runnerScene.anims.generateFrameNumbers(this.spriteType, { start: 3, end: 3 }),
        frameRate: 0,
        repeat: 0
      })
    
      this.runnerScene.anims.create({
        key: 'jump',
        frames: this.runnerScene.anims.generateFrameNumbers(this.spriteType, { start: 4, end: 4 }),
        frameRate: 0,
        repeat: 0
      })
    
      this.runnerScene.anims.create({
        key: 'fall',
        frames: this.runnerScene.anims.generateFrameNumbers(this.spriteType, { start: 5, end: 5 }),
        frameRate: 0,
        repeat: 0
      })
      this.playRunAnim()
    } else {
      // Initialize custom art character
      const scale = utils.getIdealSpriteScale(this.runnerScene.textures.get(this.spriteType), false)
      this.sprite = this.runnerScene.physics.add.sprite(constants.GAME.START_POS, constants.GAME.START_HEIGHT, this.spriteType).setScale(scale, scale)
    }
  
    this.sprite.setBounce(constants.PLAYER.BOUNCE)
    this.sprite.setDepth(constants.PLAYER.RENDER_DEPTH)
    this.setRunSpeed(this.runSpeed)
  }

  tryJump = () => {
    if(!this.runnerScene.isGameOver && this.sprite.body.touching.down) {
      this.sprite.setVelocityY(-1 * constants.PLAYER.JUMP_STRENGTH)
      this.audioRefs.jumpSfx.play()
    }
  }

  getTravelDistance = () => {
    return this.sprite.x
  }

  die = () => {
    if(this.spriteType === 'dino') {
      this.sprite.anims.play('die', false)
    }
    this.setRunSpeed(0)
  }
  
  setRunSpeed = (speed) => {
    this.runSpeed = speed
    this.sprite.setVelocityX(speed)
  }

  // Play run anim if default character
  playRunAnim = () => {
    if(this.spriteType !== 'dino') { return }

    const anim = this.runSpeed >= 1400 ? 'runFast' : 'run'
    this.sprite.anims.play(anim, true)
  }

  // Update animation depending on velocity
  update() {
    if(this.spriteType !== 'dino') { return }

    // Set jump animation
    if(this.sprite.body.velocity.y > 0) {
      this.sprite.anims.play('fall', true)
    } else if(this.sprite.body.velocity.y < 0) {
      this.sprite.anims.play('jump', true)
    } else {
      this.playRunAnim()
    }    
  }
}
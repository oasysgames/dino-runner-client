import * as constants from "../../constants.js"
import CustomFixedButton from "../interfaceElements/CustomFixedButton.js"
import Phaser from 'phaser'

// Class for interface shown during runner game
export default class UserInterface {
  constructor(runnerScene, restartGame, returnToMenu, audioRefs) {
    this.runnerScene = runnerScene
    this.restartGame = restartGame
    this.returnToMenu = returnToMenu
    this.audioRefs = audioRefs
    this.textFont = '"Press Start 2P"'
    this.scoreText
    this.addressText
    this.restartButton
    this.menuButton

    this.initUI()
  }

  initUI = () => {
    this.scoreText = this.runnerScene.add.text(25, 65, 'Score: 0', { fontSize: '32px', fill: '#FFF', fontFamily: this.textFont })
    this.addressText = this.runnerScene.add.text(25, 25, 'Address: 0x0', { fontSize: '20px', fill: '#FFF', fontFamily: this.textFont })
    this.scoreText.setScrollFactor(0)
    this.scoreText.setDepth(constants.INTERFACE.HUD_RENDER_DEPTH)
    this.addressText.setScrollFactor(0)
    this.addressText.setDepth(constants.INTERFACE.HUD_RENDER_DEPTH)

    this.createMenuButtons()
  }

  restartClick = () => {
    this.audioRefs.selectSfx.play()
    this.restartGame()
  }

  menuClick = () => {
    this.audioRefs.selectSfx.play()
  }

  createMenuButtons = () => {
    this.createRestartButton()
    this.createBackToMenuButton()
  }

  createRestartButton = () => {
    this.restartButton = new CustomFixedButton(
      this.runnerScene, constants.GAME.CANVAS_WIDTH / 2,
      constants.GAME.CANVAS_HEIGHT / 2 - 50,
      'buttonRestartUp', 'buttonRestartDown',
      1
    )
    this.runnerScene.add.existing(this.restartButton)
    this.restartButton.setVisible(false)

    // Set button interactive for desktop and mobile
    this.restartButton.overImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.restartClick)
    this.restartButton.upImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.restartClick)
  }

  createBackToMenuButton = () => {
    this.menuButton = new CustomFixedButton(
      this.runnerScene, constants.GAME.CANVAS_WIDTH / 2,
      constants.GAME.CANVAS_HEIGHT / 2 + 50,
      'buttonMenuUp', 'buttonMenuDown',
      1
    )
    this.runnerScene.add.existing(this.menuButton)
    this.menuButton.setVisible(false)

    // Set button interactive for desktop and mobile
    this.menuButton.overImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.returnToMenu)
    this.menuButton.upImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.returnToMenu)
  }
  
  updateAddressText = (address) => {
    this.addressText.setText('Address: ' + address)
  }

  updateScoreText = (score) => {
    this.scoreText.setText('Score: ' + score)
  }
}
import Phaser from 'phaser'

// Class for button that can switch between hover and non hover image
// which has a fixed position and works in our runner scene
export default class CustomFixedButton {
  constructor(scene, x, y, upTexture, overTexture, scale) {
    this.upImage = scene.add.image(x, y, upTexture)
    this.overImage = scene.add.image(x, y, overTexture)

    this.upImage.setScrollFactor(0, 0)
    this.upImage.setScale(scale)

    this.overImage.setScrollFactor(0, 0)
    this.overImage.setScale(scale)
    this.overImage.setVisible(false)

    // Add events to switch between hover and non hover image
    this.upImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.upImage.setVisible(false)
        this.overImage.setVisible(true)
      })
    this.overImage.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        this.upImage.setVisible(true)
        this.overImage.setVisible(false)
      })
  }

  setVisible(setActive) {
    this.upImage.setVisible(setActive)
  }
}
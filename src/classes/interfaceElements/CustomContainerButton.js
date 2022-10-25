import Phaser from 'phaser'

// Class for button that can switch between hover and non hover image
export default class CustomContainerButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y, upTexture, overTexture, scale = 1) {
    super(scene, x, y)

    this.upImage = scene.add.image(0, 0, upTexture)
    this.overImage = scene.add.image(0, 0, overTexture)

    this.upImage.setScale(scale)
    this.overImage.setScale(scale)

    this.add(this.upImage)
    this.add(this.overImage)

    this.overImage.setVisible(false)

    this.setSize(this.upImage.width * scale, this.upImage.height * scale)

    // Add event to switch between hover and non hover image
    this.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, () => {
        this.upImage.setVisible(false)
        this.overImage.setVisible(true)
      })
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => {
        this.upImage.setVisible(true)
        this.overImage.setVisible(false)
      })
  }
}
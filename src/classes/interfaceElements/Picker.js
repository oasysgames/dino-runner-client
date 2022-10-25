import Phaser from 'phaser'
import * as utils from "../../utils.js"

// Class which allows switching between one of many items
// used together with a left and right button to switch between
export default class Picker extends Phaser.GameObjects.Container {
  constructor(scene, x, y, baseSprites, customArtLinks) {
    super(scene, x, y)

    this.scene = scene
    this.baseSprites = baseSprites
    this.customArtLinks = customArtLinks
    this.pickerImages = []
    this.allImgRefs = []
    this.selectedIndex = 0

    this.initImages()
    this.setSelected(this.selectedIndex)

    // Initialize to first custom if exists
    this.initToCustom()
  }

  // Initialize image data for base and custom sprites
  initImages() {
    this.baseSprites.forEach(s => {
      const image = this.scene.add.sprite(0, 0, s)
      this.add(image)
      this.pickerImages.push(image)
      this.allImgRefs.push(s)
      image.setVisible(false)
    })

    this.customArtLinks.forEach(s => {
      const image = this.scene.add.sprite(0, 0, s.imageLink)
      this.add(image)
      this.pickerImages.push(image)
      this.allImgRefs.push(s.imageLink)
      image.setVisible(false)

      const scale = utils.getIdealSpriteScale(this.scene.textures.get(s.imageLink), false)
      image.setScale(scale)
    })

    this.setSize(this.pickerImages[0].width, this.pickerImages[0].height)
  }

  setSelected(index) {
    this.pickerImages[this.selectedIndex].setVisible(false)
    this.selectedIndex = index
    this.pickerImages[index].setVisible(true)
  }

  // Pass -1 for left and 1 for right as directionNum
  cycleSelected(directionNum) {
    if(directionNum !== 1 && directionNum !== -1) { return }

    // Hide previously selected
    this.pickerImages[this.selectedIndex].setVisible(false)

    // Wrap selected around if first or last index
    this.selectedIndex += directionNum
    if(this.selectedIndex <= -1) {
      this.selectedIndex = this.pickerImages.length - 1
    } else if(this.selectedIndex > this.pickerImages.length - 1) {
      this.selectedIndex = 0
    }

    this.setSelected(this.selectedIndex)
  }

  // Initialize to first custom image if exists
  initToCustom() {
    if(this.customArtLinks.length < 1) { return }
    this.setSelected(this.baseSprites.length)
  }

  // Add custom art to this picker to be reflected instantly
  addCustomArt(imgLink) {
    if(this.customArtLinks.includes(imgLink)) { return }

    this.customArtLinks.push(imgLink)

    const image = this.scene.add.sprite(0, 0, imgLink)
    this.add(image)
    this.pickerImages.push(image)
    this.allImgRefs.push(imgLink)
    image.setVisible(false)

    const scale = utils.getIdealSpriteScale(this.scene.textures.get(imgLink), false)
    image.setScale(scale)

    this.initToCustom()
  }

  // Reset the art and reload the new assets on wallet switch
  updateArt(baseSprites, customArtLinks) {
    // Destroy all old images
    this.pickerImages.forEach(i => i.destroy())

    this.baseSprites = baseSprites
    this.customArtLinks = customArtLinks
    this.pickerImages = []
    this.allImgRefs = []
    this.selectedIndex = 0

    this.initImages()
    this.setSelected(this.selectedIndex)

    // Initialize to first custom if exists
    this.initToCustom()
  }
}
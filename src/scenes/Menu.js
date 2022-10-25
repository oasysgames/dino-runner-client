import Phaser from 'phaser'
import { game, web3Connection } from "../index.js"
import * as constants from "../constants.js"
import CustomContainerButton from "../classes/interfaceElements/CustomContainerButton.js"
import Picker from "../classes/interfaceElements/Picker.js"
import * as assets from "../classes/utility/Assets.js"
import WebFontFile from "../classes/utility/WebFontFile.js"
import { ethers } from "ethers"
import * as utils from "../utils.js"
import Toastify from 'toastify-js'

const charSprites = [
  "pixelDinoGreen",
  "pixelDinoBlue",
  "pixelDinoRed",
]

const spriteImageRefs = [
  assets.img.pixelDinoGreenImage,
  assets.img.pixelDinoBlueImage,
  assets.img.pixelDinoRedImage,
]

// Main menu and customization scene
export default class Menu extends Phaser.Scene {
  constructor() {
    super('menu')

    this.selectSFX
    this.switchSFX

    this.networkText
    this.contractAddressText
    this.tokenIdText
    this.mainMenuItems = []
    this.customizationMenuItems = []
    this.imageContractAddress = ""
    this.imageTokenId = ""
    this.fetchedNFTArt
    this.currentImageLink

    this.characterPicker
    this.obstaclePicker
    this.cloudPicker
  }

  // Preload all images used in the menu
  preload() {
    this.load.image('background', assets.img.backgroundImage)
    this.load.image('cloudLayer', assets.img.cloudLayerImage)
    this.load.image('backLayer', assets.img.backLayerImage)
    this.load.image('randomAll', assets.img.randomAll)

    this.load.audio('select', assets.audio.selectAudio)
    this.load.audio('switch', assets.audio.switchAudio)

    this.load.image('buttonPlayUp', assets.ui.buttonPlayUpImage)
    this.load.image('buttonPlayDown', assets.ui.buttonPlayDownImage)
    this.load.image('buttonCustomizeUp', assets.ui.buttonCustomizeUpImage)
    this.load.image('buttonCustomizeDown', assets.ui.buttonCustomizeDownImage)
    this.load.image('buttonPasteUp', assets.ui.buttonPasteUpImage)
    this.load.image('buttonPasteDown', assets.ui.buttonPasteDownImage)
    this.load.image('buttonFetchUp', assets.ui.buttonFetchUpImage)
    this.load.image('buttonFetchDown', assets.ui.buttonFetchDownImage)
    this.load.image('buttonHomeverseUp', assets.ui.buttonHomeverseUpImage)
    this.load.image('buttonHomeverseDown', assets.ui.buttonHomeverseDownImage)
    this.load.image('buttonEthereumUp', assets.ui.buttonEthereumUpImage)
    this.load.image('buttonEthereumDown', assets.ui.buttonEthereumDownImage)
    this.load.image('buttonPolygonUp', assets.ui.buttonPolygonUpImage)
    this.load.image('buttonPolygonDown', assets.ui.buttonPolygonDownImage)
    this.load.image('buttonAsPlayerUp', assets.ui.buttonAsPlayerUpImage)
    this.load.image('buttonAsPlayerDown', assets.ui.buttonAsPlayerDownImage)
    this.load.image('buttonAsObstacleUp', assets.ui.buttonAsObstacleUpImage)
    this.load.image('buttonAsObstacleDown', assets.ui.buttonAsObstacleDownImage)
    this.load.image('buttonAsCloudUp', assets.ui.buttonAsCloudUpImage)
    this.load.image('buttonAsCloudDown', assets.ui.buttonAsCloudDownImage)
    this.load.image('buttonSourceUp', assets.ui.buttonSourceUpImage)
    this.load.image('buttonSourceDown', assets.ui.buttonSourceDownImage)
    this.load.image('buttonConnectWalletUp', assets.ui.buttonConnectWalletUpImage)
    this.load.image('buttonConnectWalletDown', assets.ui.buttonConnectWalletDownImage)
    this.load.image('buttonDisconnectUp', assets.ui.buttonDisconnectUpImage)
    this.load.image('buttonDisconnectDown', assets.ui.buttonDisconnectDownImage)

    this.load.image('buttonLeftUp', assets.ui.buttonLeftUpImage)
    this.load.image('buttonLeftDown', assets.ui.buttonLeftDownImage)
    this.load.image('buttonRightUp', assets.ui.buttonRightUpImage)
    this.load.image('buttonRightDown', assets.ui.buttonRightDownImage)
    this.load.image('buttonMenuUp', assets.ui.buttonMenuUpImage)
    this.load.image('buttonMenuDown', assets.ui.buttonMenuDownImage)

    this.load.image('rockTall', assets.img.rockTallImage)
    this.load.image('cloud', assets.img.cloudImage)

    // Load dino images
    charSprites.forEach((s, i) => {
      this.load.spritesheet(`${s}`, spriteImageRefs[i], { frameWidth: 100, frameHeight: 90 })
    })

    // Load images for all registered arts
    utils.getAllArtLinks(web3Connection.web3Address).forEach(a => {
      this.load.image(a.imageLink, a.imageLink)
    })

    this.load.addFile(new WebFontFile(this.load, 'Aldrich'))
  }

  // Initialize menu on scene start
  create() {
    this.selectSFX = this.sound.add('select')
    this.switchSFX = this.sound.add('switch')

    // Set up background layers
    this.add.image(constants.GAME.CANVAS_WIDTH / 2, constants.GAME.CANVAS_HEIGHT / 2, 'background')
    this.add.image(constants.GAME.CANVAS_WIDTH / 2, constants.GAME.CANVAS_HEIGHT / 2 + 100, 'cloudLayer')
    this.add.image(constants.GAME.CANVAS_WIDTH / 2, constants.GAME.CANVAS_HEIGHT / 2, 'backLayer')

    // Init both menus and set main menu to active
    this.initMainMenu()
    this.initCustomizationMenu()
    this.setMainMenuActive(true)
  
    this.networkText = this.add.text(15, 15, 'Please connect Wallet', { fontSize: '20px', fill: '#FFF', fontFamily: 'Aldrich' })
    if(web3Connection.web3Network) {
      this.updateNetworkText(web3Connection.web3Network)
    }
  }

  initMainMenu = () => {
    const pickerRowHeight = constants.GAME.CANVAS_HEIGHT / 2 + 100
    const pickerTextHeight = pickerRowHeight - 110

    // Char Picker
    this.characterPicker = new Picker(this, constants.GAME.CANVAS_WIDTH / 2, pickerRowHeight, charSprites, utils.getSavedArtsForTypeOfAddress("player", web3Connection.web3Address))
    this.add.existing(this.characterPicker)
  
    const characterPickerText = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2,
      pickerTextHeight,
      'Player',
      { fontSize: '45px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5, 0.5)

    const leftButtonCharPicker = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2 - 125, pickerRowHeight, 'buttonLeftUp', 'buttonLeftDown', 1)
    this.add.existing(leftButtonCharPicker)
    leftButtonCharPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.characterPicker.cycleSelected(-1)
        this.switchSFX.play()
      })

    const rightButtonCharPicker = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2 + 125, pickerRowHeight, 'buttonRightUp', 'buttonRightDown', 1)
    this.add.existing(rightButtonCharPicker)
    rightButtonCharPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.characterPicker.cycleSelected(1)
        this.switchSFX.play()
      })

    // Obstacle Picker
    const leftColumnPos = constants.GAME.CANVAS_WIDTH / 2 - 410
    const obstacleSprites = utils.getSavedArtsForTypeOfAddress("obstacles", web3Connection.web3Address).length >= 1 ? ["rockTall", "randomAll"] : ["rockTall"]
    this.obstaclePicker = new Picker(this, leftColumnPos, pickerRowHeight, obstacleSprites, utils.getSavedArtsForTypeOfAddress("obstacles", web3Connection.web3Address))
    this.add.existing(this.obstaclePicker)
  
    const obstaclePickerText = this.add.text(
      leftColumnPos,
      pickerTextHeight,
      'Obstacles',
      { fontSize: '45px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5, 0.5)

    const leftButtonObstaclesPicker = new CustomContainerButton(this, leftColumnPos - 125, pickerRowHeight, 'buttonLeftUp', 'buttonLeftDown', 1)
    this.add.existing(leftButtonObstaclesPicker)
    leftButtonObstaclesPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.obstaclePicker.cycleSelected(-1)
        this.switchSFX.play()
      })

    const rightButtonObstaclesPicker = new CustomContainerButton(this, leftColumnPos + 125, pickerRowHeight, 'buttonRightUp', 'buttonRightDown', 1)
    this.add.existing(rightButtonObstaclesPicker)
    rightButtonObstaclesPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.obstaclePicker.cycleSelected(1)
        this.switchSFX.play()
      })

    // Cloud Picker
    const rightColumnPos = constants.GAME.CANVAS_WIDTH / 2 + 410
    const cloudSprites = utils.getSavedArtsForTypeOfAddress("clouds", web3Connection.web3Address).length >= 1 ? ["cloud", "randomAll"] : ["cloud"]
    this.cloudPicker = new Picker(this, rightColumnPos, pickerRowHeight, cloudSprites, utils.getSavedArtsForTypeOfAddress("clouds", web3Connection.web3Address))
    this.add.existing(this.cloudPicker)
  
    const cloudPickerText = this.add.text(
      rightColumnPos,
      pickerTextHeight,
      'Clouds',
      { fontSize: '45px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5, 0.5)

    const leftButtonCloudsPicker = new CustomContainerButton(this, rightColumnPos - 125, pickerRowHeight, 'buttonLeftUp', 'buttonLeftDown', 1)
    this.add.existing(leftButtonCloudsPicker)
    leftButtonCloudsPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.cloudPicker.cycleSelected(-1)
        this.switchSFX.play()
      })

    const rightButtonCloudsPicker = new CustomContainerButton(this, rightColumnPos + 125, pickerRowHeight, 'buttonRightUp', 'buttonRightDown', 1)
    this.add.existing(rightButtonCloudsPicker)
    rightButtonCloudsPicker.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.cloudPicker.cycleSelected(1)
        this.switchSFX.play()
      })

    const startButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, constants.GAME.CANVAS_HEIGHT / 2 + 225, 'buttonPlayUp', 'buttonPlayDown', 1)
    this.add.existing(startButton)
    startButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.scene.start('runner', {
          characterSprite: this.characterPicker.allImgRefs[this.characterPicker.selectedIndex],
          obstacleSprite: this.obstaclePicker.allImgRefs[this.obstaclePicker.selectedIndex],
          cloudSprite: this.cloudPicker.allImgRefs[this.cloudPicker.selectedIndex],
        })
        this.selectSFX.play()
      })

    const customizeButtonHeight = constants.GAME.CANVAS_HEIGHT / 2 - 100
    const customizeButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, customizeButtonHeight, 'buttonCustomizeUp', 'buttonCustomizeDown', 1)
    this.add.existing(customizeButton)
    customizeButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.setMainMenuActive(false)
        this.selectSFX.play()
      })

    const customizeExplanationText = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2,
      customizeButtonHeight - 100,
      [
        "Use ANY owned NFT",
        "as a Skin!"
      ],
      { fontSize: '36px', fill: '#FFF', fontFamily: 'Aldrich', align: "center" }
    ).setOrigin(0.5, 0.5)

    const topButtonsHeight = constants.GAME.CANVAS_HEIGHT / 2 - 200
    const sourceCodeButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH - 125, topButtonsHeight, 'buttonSourceUp', 'buttonSourceDown', 1)
    this.add.existing(sourceCodeButton)
    sourceCodeButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        window.open(constants.GAME.SOURCE_CODE_URL, "_blank")
        this.selectSFX.play()
      })

    this.connectWalletButton = new CustomContainerButton(this, 125, topButtonsHeight, 'buttonConnectWalletUp', 'buttonConnectWalletDown', 1)
    this.add.existing(this.connectWalletButton)
    this.connectWalletButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        web3Connection.initWeb3()
        this.selectSFX.play()
      })
    
    this.disconnectButton = new CustomContainerButton(this, 125, topButtonsHeight, 'buttonDisconnectUp', 'buttonDisconnectDown', 1)
    this.add.existing(this.disconnectButton)
    this.disconnectButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        web3Connection.disconnectWallet()
        this.selectSFX.play()
      })
    this.disconnectButton.setVisible(false)
  
    // Save main menu items in group for visibility toggling
    this.mainMenuItems.push(
      this.characterPicker, leftButtonCharPicker, rightButtonCharPicker, this.obstaclePicker,
      leftButtonObstaclesPicker, rightButtonObstaclesPicker, this.cloudPicker, leftButtonCloudsPicker,
      rightButtonCloudsPicker, startButton, customizeButton, customizeExplanationText,
      cloudPickerText, obstaclePickerText, characterPickerText, sourceCodeButton
    )
  }

  updatePickers = () => {
    const playerArts = utils.getSavedArtsForTypeOfAddress("player", web3Connection.web3Address)
    this.characterPicker.updateArt(charSprites, playerArts)

    const obstacleSprites = utils.getSavedArtsForTypeOfAddress("obstacles", web3Connection.web3Address).length >= 1 ? ["rockTall", "randomAll"] : ["rockTall"]
    this.obstaclePicker.updateArt(obstacleSprites, utils.getSavedArtsForTypeOfAddress("obstacles", web3Connection.web3Address))

    const cloudSprites = utils.getSavedArtsForTypeOfAddress("clouds", web3Connection.web3Address).length >= 1 ? ["cloud", "randomAll"] : ["cloud"]
    this.cloudPicker.updateArt(cloudSprites, utils.getSavedArtsForTypeOfAddress("clouds", web3Connection.web3Address))
  }

  initCustomizationMenu = () => {
    const leftColumnPos = constants.GAME.CANVAS_WIDTH / 2 - 410

    const explanationText = this.add.text(
      leftColumnPos, 230, 
      [
        "1. Click one of the buttons below to",
        "connect to the network your token exists on.",
        "",
        "2. Copy the contract address and token id",
        "and use the Paste buttons on the right",
        "to set the token information.",
        "",
        "3. Click Fetch to get the image data and then apply it.",
      ],
      { fontSize: '16px', fill: '#FFF', fontFamily: 'Aldrich', align: 'center' }
    ).setOrigin(0.5)

    // Left Column
    const homeverseButton = new CustomContainerButton(this, leftColumnPos, 400, 'buttonHomeverseUp', 'buttonHomeverseDown', 1)
    this.add.existing(homeverseButton)
    homeverseButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        web3Connection.suggestNetworkSwitch("homeverse")
        this.selectSFX.play()
      })

    const ethereumButton = new CustomContainerButton(this, leftColumnPos, 475, 'buttonEthereumUp', 'buttonEthereumDown', 1)
    this.add.existing(ethereumButton)
    ethereumButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        web3Connection.suggestNetworkSwitch("ethereum")
        this.selectSFX.play()
      })

    const polygonButton = new CustomContainerButton(this, leftColumnPos, 550, 'buttonPolygonUp', 'buttonPolygonDown', 1)
    this.add.existing(polygonButton)
    polygonButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        web3Connection.suggestNetworkSwitch("polygon")
        this.selectSFX.play()
      })

    // Middle Column
    const menuButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, 100, 'buttonMenuUp', 'buttonMenuDown', 1)
    this.add.existing(menuButton)
    menuButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.menuButtonPressed()
        this.selectSFX.play()
      })
    
    const contractAddressHeader = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2, 195, "CONTRACT ADDRESS:", { fontSize: '32px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5)
    this.contractAddressText = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2, 220, "NOT SET", { fontSize: '16px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5)
    const pasteContractAddressButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, 280, 'buttonPasteUp', 'buttonPasteDown', 1)
    this.add.existing(pasteContractAddressButton)
    pasteContractAddressButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.setContractAddress()
        this.selectSFX.play()
      })
  
    const tokenIdHeader = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2, 345, "TOKEN ID:", { fontSize: '32px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5)
    this.tokenIdText = this.add.text(
      constants.GAME.CANVAS_WIDTH / 2, 370, "NOT SET", { fontSize: '20px', fill: '#FFF', fontFamily: 'Aldrich' }
    ).setOrigin(0.5)
    const pasteTokenIdButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, 430, 'buttonPasteUp', 'buttonPasteDown', 1)
    this.add.existing(pasteTokenIdButton)
    pasteTokenIdButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.setTokenId()
        this.selectSFX.play()
      })

    this.fetchButton = new CustomContainerButton(this, constants.GAME.CANVAS_WIDTH / 2, 550, 'buttonFetchUp', 'buttonFetchDown', 1)
    this.add.existing(this.fetchButton)
    this.fetchButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        this.fetchData()
        this.selectSFX.play()
      })
    this.fetchButton.setAlpha(constants.INTERFACE.INACTIVE_ALPHA)

    // Right column
    this.applyAsPlayerButton = new CustomContainerButton(this, 1100, 350, 'buttonAsPlayerUp', 'buttonAsPlayerDown', 1)
    this.add.existing(this.applyAsPlayerButton)
    this.applyAsPlayerButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        utils.addArtLocalStorage(this.currentImageLink, "player", web3Connection.web3Address)
        this.characterPicker.addCustomArt(this.currentImageLink)
        this.selectSFX.play()
      })

    this.applyAsObstacleButton = new CustomContainerButton(this, 1100, 450, 'buttonAsObstacleUp', 'buttonAsObstacleDown', 1)
    this.add.existing(this.applyAsObstacleButton)
    this.applyAsObstacleButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        utils.addArtLocalStorage(this.currentImageLink, "obstacles", web3Connection.web3Address)
        this.obstaclePicker.addCustomArt(this.currentImageLink)
        this.selectSFX.play()
      })

    this.applyAsCloudButton = new CustomContainerButton(this, 1100, 550, 'buttonAsCloudUp', 'buttonAsCloudDown', 1)
    this.add.existing(this.applyAsCloudButton)
    this.applyAsCloudButton.setInteractive()
      .on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => {
        utils.addArtLocalStorage(this.currentImageLink, "clouds", web3Connection.web3Address)
        this.cloudPicker.addCustomArt(this.currentImageLink)
        this.selectSFX.play()
      })  

    // Save customization menu items in group
    this.customizationMenuItems.push(
      menuButton, this.contractAddressText, pasteContractAddressButton,
      this.tokenIdText, pasteTokenIdButton, this.fetchButton, homeverseButton,
      ethereumButton, polygonButton, this.applyAsPlayerButton, this.applyAsObstacleButton,
      this.applyAsCloudButton, tokenIdHeader, contractAddressHeader, explanationText
    )
  }

  setMainMenuActive = (setMainMenuActive) => {
    if(setMainMenuActive) {
      this.mainMenuItems.forEach(m => m.setVisible(true))
      this.customizationMenuItems.forEach(c => c.setVisible(false))

      if(!!web3Connection.web3Network) {
        this.setConnectWalletButtonVisibility(false)
      }
    } else {
      this.mainMenuItems.forEach(m => m.setVisible(false))
      this.customizationMenuItems.forEach(c => c.setVisible(true))
      this.setApplyButtonVisibility(false)
    }
  }

  updateNetworkText = (web3Network) => {
    if(!this.networkText) { return }
    const baseString = "Connected to: "
    const chainId = web3Network.chainId
    let networkName = web3Network.name

    // Turn recognized network name into more readable format
    if(networkName === 'unknown') {
      if(web3Network.chainId === constants.GAME.HMV_TEST_CHAINID) {
        networkName = "Homeverse Testnet"
      } else if(web3Network.chainId === constants.GAME.HMV_MAIN_CHAINID) {
        networkName = "Homeverse Mainnet"
      }
    } else if(networkName === 'homestead') {
      networkName = "Ethereum Mainnet"
    } else if(networkName === 'matic') {
      networkName = "Polygon Mainnet"
    }

    this.networkText.setText(`${baseString} ${networkName} (${chainId})`)  
  }

  setContractAddress = async() => {
    const contractAddress = await navigator.clipboard.readText()
    const trimmedAddress = contractAddress.trim()
    if(!this.isValidAddress(trimmedAddress)) { 
      console.log("Invalid contract address")
      Toastify({
        text: "Invalid contract address",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return 
    }

    this.imageContractAddress = trimmedAddress
    this.contractAddressText.text = trimmedAddress

    if(this.isValidId(this.imageTokenId) && this.isValidAddress(this.imageContractAddress)) {
      this.fetchButton.setAlpha(constants.INTERFACE.ACTIVE_ALPHA)
    } else {
      this.fetchButton.setAlpha(constants.INTERFACE.INACTIVE_ALPHA)
    }
  }

  setTokenId = async() => {
    const tokenId = await navigator.clipboard.readText()
    const trimmedTokenId = tokenId.trim()
    if(!this.isValidId(trimmedTokenId)) {
      console.log("Invalid token id")
      Toastify({
        text: "Invalid token id",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }

    this.imageTokenId = trimmedTokenId
    this.tokenIdText.text = trimmedTokenId

    if(this.isValidId(this.imageTokenId) && this.isValidAddress(this.imageContractAddress)) {
      this.fetchButton.setAlpha(1)
    } else {
      this.fetchButton.setAlpha(constants.INTERFACE.INACTIVE_ALPHA)
    }
  }

  isValidAddress = (address) => {
    return ethers.utils.isAddress(address)
  }

  isValidId = (tokenId) => {
    if(typeof tokenId != "string") { return false }
    if(tokenId.substring(0, 2) === '0x') { return false }
    return !isNaN(tokenId) && !isNaN(parseFloat(tokenId))
  }

  fetchData = async() => {
    if(!this.isValidAddress(this.imageContractAddress)) {
      console.log("Invalid contract address")
      Toastify({
        text: "Invalid contract address",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }
    if(!this.isValidId(this.imageTokenId)) {
      console.log("Invalid token id")
      Toastify({
        text: "Invalid token id",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }

    const imageLink = await web3Connection.fetchTokenImage(this.imageContractAddress, this.imageTokenId)
    this.currentImageLink = imageLink

    // Image loading is handled differently between new and existing images
    const texture = this.textures.get(imageLink)
    if(texture.key !== imageLink) {
      this.load.on('filecomplete', () => {
        this.replaceFetchedArt(imageLink)
        this.setApplyButtonVisibility(true)
      }, this)
      this.load.image(imageLink, imageLink)
      this.load.start()
    } else {
      this.replaceFetchedArt(imageLink)
      this.setApplyButtonVisibility(true)
    }
  }

  replaceFetchedArt = (imageLink) => {
    if(this.fetchedNFTArt) {
      this.fetchedNFTArt.destroy()
    }

    // Use image link address as name as well for easier management
    this.fetchedNFTArt = this.add.image(1100, 200, imageLink)
    const scale = utils.getIdealSpriteScale(this.textures.get(imageLink), false)
    this.fetchedNFTArt.setScale(scale, scale)
    this.fetchedNFTArt.setOrigin(0.5, 0.5)
  }

  menuButtonPressed = () => {
    this.setMainMenuActive(true)
    
    if(this.fetchedNFTArt) {
      this.fetchedNFTArt.destroy()
    }

    // Reset customization data
    this.imageContractAddress = null
    this.imageTokenId = null
    this.contractAddressText.text = "NOT SET"
    this.tokenIdText.text = "NOT SET"
  }

  setApplyButtonVisibility = (setVisible) => {
    this.applyAsPlayerButton.setVisible(setVisible)
    this.applyAsObstacleButton.setVisible(setVisible)
    this.applyAsCloudButton.setVisible(setVisible)
  }

  setConnectWalletButtonVisibility = (setVisible) => {
    if(!this.connectWalletButton) { return }
    this.connectWalletButton.setVisible(setVisible)

    if(!this.disconnectButton) { return }
    if(setVisible) {
      this.disconnectButton.setVisible(false)
    } else if (!setVisible && !!web3Connection.web3Network) {
      // Only show disconnect button if connected and connect button is hidden
      this.disconnectButton.setVisible(true)
    }
  }
}
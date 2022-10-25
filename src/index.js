import Menu from "./scenes/Menu.js"
import Runner from "./scenes/Runner.js"
import Web3Connection from "./classes/utility/Web3Connection.js"
import * as constants from "./constants.js"
import Phaser from 'phaser'

// This file acts as the starting point and initializes phaser and the web3 connection

var config = {
  type: Phaser.AUTO,
  width: constants.GAME.CANVAS_WIDTH,
  height: constants.GAME.CANVAS_HEIGHT,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: constants.GAME.GRAVITY_Y },
      // Turn debug on to see collision boxes
      // debug: true,
    }
  },
  // Initializes both the menu and runner scene
  scene: [Menu, Runner],

  // Center canvas element on website
  autoCenter: Phaser.Scale.CENTER_BOTH,
}

// Creates new instance of phaser game
const game = new Phaser.Game(config)

// Nav bar height fix for mobile browsers
const setFillHeight = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`)
}
let vh = window.innerHeight
window.addEventListener('resize', () => {
  if (vh === window.innerHeight) {
    return
  }

  vh = window.innerHeight
  setFillHeight()
})
setFillHeight()

// Initialize web3 connection
const web3Connection = new Web3Connection(game)
web3Connection.initWeb3()

export { game, web3Connection }
import * as constants from "./constants.js"
import Toastify from 'toastify-js'

// This file contains utility functions used throghout the project

const randomNumInRange = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// Determine sprite size to resize nft images that are too big
const getIdealSpriteScale = (texture, isRock) => {
  const srcImg = texture.getSourceImage()
  const imgWidth = srcImg.width
  const imgHeight = srcImg.height
  
  // Determine biggest value and set scale
  let scale = 1
  let biggestValue = imgWidth
  if(imgHeight > imgWidth) {
    biggestValue = imgHeight
  }

  let maxSize = isRock ? constants.GAME.CUSTOM_IMG_MAX_SIZE_ROCK : constants.GAME.CUSTOM_IMG_MAX_SIZE

  if(biggestValue > maxSize) {
    scale = maxSize / biggestValue
  }

  return scale
}

// Type is either "player", "obstacles" or "clouds"
const addArtLocalStorage = (imageLink, type, address) => {
  let artLinks = JSON.parse(localStorage.getItem(constants.GAME.CUSTOM_ART_KEY))
  if(!artLinks) {
    artLinks = {player: [], obstacles: [], clouds: []}
  }

  if(!artLinks[type].includes(imageLink)) {
    artLinks[type].push({imageLink, address})
    localStorage.setItem(constants.GAME.CUSTOM_ART_KEY, JSON.stringify(artLinks))
  }

  // Show message if saved or already existed
  Toastify({
    text: `Saved nft image as ${type}`,
    duration: 3000,
    gravity: "top",
    position: "center",
    style: {
      background: "linear-gradient(to right, #00b09b, #96c93d)",
    },
  }).showToast();
}

// Type is either "player", "obstacles" or "clouds"
const getSavedArtsForType = (type) => {
  let artLinks = JSON.parse(localStorage.getItem(constants.GAME.CUSTOM_ART_KEY))
  if(artLinks) {
    return artLinks[type]
  }

  return []
}

const getSavedArtsForTypeOfAddress = (type, address) => {
  let artLinks = JSON.parse(localStorage.getItem(constants.GAME.CUSTOM_ART_KEY))
  if(artLinks) {
    const validArtLinks = []
    // Filter by address
    artLinks[type].forEach(a => {
      if(a.address === address) {
        validArtLinks.push(a)
      }
    })
    return validArtLinks
  }

  return []
}

const getAllArtLinks = (address) => {
  let artLinks = JSON.parse(localStorage.getItem(constants.GAME.CUSTOM_ART_KEY))
  if(artLinks) {
    const allLinks = [...artLinks.player, ...artLinks.obstacles, ...artLinks.clouds]
    return allLinks
  }

  // Return empty array if none
  return []
}

export { randomNumInRange, getIdealSpriteScale, addArtLocalStorage, getAllArtLinks, getSavedArtsForType, getSavedArtsForTypeOfAddress }
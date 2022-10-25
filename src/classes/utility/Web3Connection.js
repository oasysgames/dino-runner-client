import { ethers } from "ethers"
import erc721Abi from "../../assets/contracts/Erc721Abi.json"
import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from 'web3modal'
import Toastify from 'toastify-js'

export default class Web3Connection {
  constructor(game) {
    this.game = game

    this.web3Modal
    this.provider
    this.web3Provider
    this.web3Signer
    this.web3Address = "0x0"
    this.web3Network
  }

  // Init web3 modal
  initWeb3 = async() => {
    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: {
          rpc: {
            40875: "https://rpc.testnet.oasys.homeverse.games/",
            19011: "https://rpc.mainnet.oasys.homeverse.games/",
          },
        }
      },
    }

    this.web3Modal = new Web3Modal({
      network: "mainnet",
      cacheProvider: true,
      providerOptions,
    })

    try {
      this.provider = await this.web3Modal.connect()
      await this.setEthers()
     
      // Update network text on menu scene
      this.game.scene.scenes[0].updateNetworkText(this.web3Network)
      this.game.scene.scenes[0].setConnectWalletButtonVisibility(false)
      this.game.scene.scenes[0].updatePickers()
    } catch (e) {
      console.log(e)
      console.log("Couldn't initialize Web3")
      Toastify({
        text: "Couldn't initialize Web3",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast();
    }

    this.provider.on("chainChanged", this.handleNetworkSwitch)
    this.provider.on("accountsChanged", this.handleAccountSwitch)
  }

  // Pop up window suggesting to the user to switch active network
  // Network can be "homeverse", "ethereum" or "polygon"
  suggestNetworkSwitch = async(network) => {
    if(!window || !window.ethereum) { return }

    try{
      // For eth mainnet we use "wallet_switchEthereumChain" instead of "wallet_addEthereumChain"
      switch(network) {
        case "homeverse":
          window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
                chainId: "0x4A43",
                rpcUrls: ["https://rpc.mainnet.oasys.homeverse.games/"],
                chainName: "Homeverse",
                nativeCurrency: {
                    name: "OAS",
                    symbol: "OAS",
                    decimals: 18
                },
                blockExplorerUrls: ["https://explorer.mainnet.oasys.homeverse.games/"]
            }]
          })
          break
        case "ethereum":
          window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{
              chainId: "0x1",
            }]
          })
          break
        case "polygon":
          window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [{
              chainId: "0x89",
              rpcUrls: ["https://polygon-rpc.com"],
              chainName: "POLYGON",
              nativeCurrency: {
                  name: "Matic",
                  symbol: "MATIC",
                  decimals: 18
              },
              blockExplorerUrls: ["https://polygonscan.com/"]
            }]
          })
          break 
      }  
    } catch (e) {
      Toastify({
        text: "Could not switch network. You might already be connected to this network or your browser only support manual network switching.",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      console.log("Could not switch network. You might already be connected to this network or your browser only support manual network switching.")
      throw 'Could not switch network. You might already be connected to this network or your browser only support manual network switching.'
    }
  }

  // Initialize web3 settings through ethers
  setEthers = async() => {
    this.web3Provider = new ethers.providers.Web3Provider(this.provider)
    this.web3Signer = this.web3Provider.getSigner()
    this.web3Address = await this.web3Signer.getAddress()
    this.web3Network = await this.web3Provider.getNetwork()
  }

  // Reset ethers settings and show new network in ui
  handleNetworkSwitch = async() => {
    await this.setEthers()

    // Update network text on menu
    this.game.scene.scenes[0].updateNetworkText(this.web3Network)
  }

  // Reset ethers settings and update Address related things
  handleAccountSwitch = async() => {
    await this.setEthers()

    // Update pickers
    this.game.scene.scenes[0].updatePickers()
  }

  // Initialize contract of nft, do an owner check and get image data
  fetchTokenImage = async(address, tokenId) => {
    try {
      this.nftContract = new ethers.Contract(address, erc721Abi, this.web3Provider)
    } catch(e) {
      console.log(e)
      console.log("Couldn't initialize Web3")
      Toastify({
        text: "Couldn't initialize contract",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }

    // Get owner address of nft
    let nftOwnerAddress
    try {
      nftOwnerAddress = await this.nftContract.ownerOf(ethers.BigNumber.from(tokenId))
    } catch(e) {
      Toastify({
        text: "Couldn't get token owner! Are you sure you are connected to the correct network and the token is a valid NFT?",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      console.log(e)
      throw e
    }

    // Have user sign a message to verify they own the nft
    const message = 'Verify NFT Ownership to fetch image'
    let sig
    try{
      sig = await this.web3Signer.signMessage(message)

      // Show loading toast
      Toastify({
        text: "Loading token image...",
        duration: 2000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #05ff00, #097949)",
        },
    }).showToast()
    } catch(e) {
      Toastify({
        text: "User denied message signature",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      console.log("User denied message signature")
      throw 'User denied message signature'
    }

    if(nftOwnerAddress !== ethers.utils.verifyMessage(message, sig)) {
      Toastify({
        text: "You are not the owner of this NFT. Please select an NFT you own in this wallet.",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      console.log("NOT THE OWNER")
      throw 'Not The Owner'
    }

    let tokenUri
    try {
      tokenUri = await this.nftContract.tokenURI(ethers.BigNumber.from(tokenId))
    } catch(e) {
      console.log(e)
      Toastify({
        text: "Couldn't get tokenURI! Are you sure you are connected to the correct network and the token is a valid NFT?",
        duration: 5000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }

    let response
    try {
      response = await fetch(tokenUri)
    } catch(e) {
      console.log(e)
      Toastify({
        text: "Couldn't fetch token metadata.",
        duration: 3000,
        gravity: "top",
        position: "center",
        style: {
          background: "linear-gradient(to right, #790909, #ff5e00)",
        },
      }).showToast()
      return
    }

    const metadata = await response.json()
    return metadata.image
  }

  disconnectWallet = () => {
    this.web3Modal.clearCachedProvider()
    window.location.reload()
  }
}
import Phaser from 'phaser'
import WebFont from 'webfontloader'

export default class WebFontFile extends Phaser.Loader.File
{
	constructor(loader, fontNames, service = 'google') {
		super(loader, {
			type: 'webfont',
			key: fontNames.toString()
		})

		this.fontNames = Array.isArray(fontNames) ? fontNames : [fontNames]
		this.service = service

		this.fontsLoadedCount = 0
	}

	load() {
		const config = {
			fontactive: (familyName) => {
				this.checkLoadedFonts(familyName)
			},
			fontinactive: (familyName) => {
				this.checkLoadedFonts(familyName)
			}
		}

		switch (this.service) {
			case 'google':
				config[this.service] = this.getGoogleConfig()
				break

			default:
				throw new Error('Unsupported font service')
		}
		

		WebFont.load(config)
	}

	getGoogleConfig() {
		return {
			families: this.fontNames
		}
	}

	checkLoadedFonts(familyName) {
		if (this.fontNames.indexOf(familyName) < 0) {
			return
		}

		this.fontsLoadedCount++
		if (this.fontsLoadedCount >= this.fontNames.length) {
			this.loader.nextFile(this, true)
		}
	}
}

import 'dotenv/config'

import * as fs from 'fs';
import * as glob from 'glob'
const fontkit = require('fontkit')
import { Font } from 'fontkit'
import { registerFont, createCanvas } from 'canvas'

const canvasSize = {
  width: process.env.CANVAS_WIDTH || 360,
  height: process.env.CANVAS_HEIGHT || 40,
}
const canvas = createCanvas(+canvasSize.width, +canvasSize.height)

const makeOutput = (font: Font) => {
  return new Promise(resolve => {
    const ctx = canvas.getContext('2d')

    const fontSize = process.env.FONT_SIZE || 24

    ctx.font = `${fontSize}px "${font.familyName}"`
    const text = font.fullName
    const textPosition = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, textPosition.x, textPosition.y)

    const out = fs.createWriteStream(`${__dirname}/output/${font.postscriptName}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => {
      console.log(`[output-over] ${font.postscriptName}`)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      resolve(true)
    })
  })
}

export const exportImages = async () => {
  const files = glob.sync('input/*.@(TTF|ttf|OTF|otf)')
  fontkit.setDefaultLanguage(process.env.LANGUAGE)

  for (const file of files) {
    const font = fontkit.openSync(file)
    registerFont(file, { family: font.familyName })
    await makeOutput(font)
  }
}


exportImages()

import * as fs from 'fs';
import * as glob from 'glob'
const fontkit = require('fontkit')
import { Font } from 'fontkit'
import { registerFont, createCanvas } from 'canvas'

const canvas = createCanvas(360, 40)

const makeOutput = (font: Font) => {
  return new Promise(resolve => {
    const ctx = canvas.getContext('2d')

    ctx.font = `24px "${font.familyName}"`
    const text = font.postscriptName
    const textPosition = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, textPosition.x, textPosition.y)

    const out = fs.createWriteStream(`${__dirname}/output/${font.fullName}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => {
      console.log(`output-over: ${font.familyName}|${font.fullName}`)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      resolve(true)
    })
  })
}

const files = glob.sync('input/*.@(TTF|ttf|OTF|otf)');

(async () => {
  for (const file of files) {
    const font = fontkit.openSync(file)
    registerFont(file, { family: font.familyName })
    await makeOutput(font)
  }
})()

import 'dotenv/config'

import * as fs from 'fs';
import * as glob from 'glob'
import * as opentype from 'opentype.js'
import { Font } from 'opentype.js'
import { registerFont, createCanvas } from 'canvas'

const lang = process.env.LANGUAGE
const getLangName = (property) => property?.[lang] || property['en']

const canvasSize = {
  width: process.env.CANVAS_WIDTH || 360,
  height: process.env.CANVAS_HEIGHT || 40,
}
const canvas = createCanvas(+canvasSize.width, +canvasSize.height)

const makeOutput = (font: Font) => {
  const ctx = canvas.getContext('2d')

  const {fullName: fullNames, fontFamily: fontFamilies, postScriptName: postScriptNames} = font.names

  const fullName = getLangName(fullNames)
  const fontFamily = getLangName(fontFamilies)
  const postScriptName = getLangName(postScriptNames)

  const fontSize = process.env.FONT_SIZE || 24

  ctx.font = `${fontSize}px "${fontFamily}"`
  const text = fullName
  const textPosition = {
    x: canvas.width / 2,
    y: canvas.height / 2
  }
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, textPosition.x, textPosition.y)

  return new Promise(resolve => {
    const out = fs.createWriteStream(`${__dirname}/output/${postScriptName}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => {
      console.log(`[output-over] ${postScriptName}`)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      resolve(true)
    })
  })
}

export const exportImages = async () => {
  const files = glob.sync('input/*.@(TTF|ttf|OTF|otf)')

  for (const file of files) {
    const font = await opentype.load(file)

    registerFont(file, { family: getLangName(font.names.fontFamily) })
    await makeOutput(font)
  }
}

exportImages()

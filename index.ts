import 'dotenv/config'

import * as fs from 'fs';
import * as glob from 'glob'
import { load, Font } from 'opentype.js'
import { registerFont, createCanvas } from 'canvas'

const lang = process.env.LANGUAGE
const getLangName = (property) => property?.[lang] || property['en']

const canvasSize = {
  width: process.env.CANVAS_WIDTH || 360,
  height: process.env.CANVAS_HEIGHT || 40,
}
const canvas = createCanvas(+canvasSize.width, +canvasSize.height)

/**
 * Draw and export image of fontname as font.
 * @param font: Font
 * @returns result: Promise<boolean>
 */
const makeOutput = (font: Font) => {
  const ctx = canvas.getContext('2d')

  const {fullName: fullNames, postScriptName: postScriptNames} = font.names

  const fullName = getLangName(fullNames)
  const fontSize = +(process.env.FONT_SIZE) || 24

  const text = fullName
  const textPosition = {
    x: 0,
    y: canvas.height - fontSize / 2
  }

  font.draw(ctx, text, textPosition.x, textPosition.y, fontSize)

  const postScriptName = getLangName(postScriptNames)

  return new Promise(resolve => {
    const out = fs.createWriteStream(`${__dirname}/output/${postScriptName}.png`)
    const stream = canvas.createPNGStream()
    stream.pipe(out)
    out.on('finish', () => {
      console.debug(`[output-over] ${postScriptName}`)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      resolve(true)
    })
  })
}

/**
 * Load input's fonts and export image their font's images.
 */
export const exportImages = async () => {
  const files = glob.sync('input/*.@(TTF|ttf|OTF|otf)')

  for (const file of files) {
    const font = await load(file)

    registerFont(file, { family: getLangName(font.names.fontFamily) })
    await makeOutput(font)
  }
}

exportImages()

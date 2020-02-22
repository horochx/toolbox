import path from 'path'
import fs from 'fs'
import http from 'http'
import https from 'https'

const cwd = process.cwd()

export function targetPath(...pathArr: string[]) {
  return path.resolve(cwd, ...pathArr)
}

export const readFile = fs.promises.readFile

export const writeFile = fs.promises.writeFile

export const mkdir = fs.promises.mkdir

export function getJSON(url: string) {
  return new Promise<string>((resolve, reject) => {
    ;(url.startsWith('https') ? https : http)
      .get(url, res => {
        const { statusCode } = res

        if (statusCode !== 200) {
          reject('Request Failed.\n' + `Status Code: ${statusCode}`)
          // Consume response data to free up memory
          res.resume()
          return
        }

        res.setEncoding('utf8')
        let rawData = ''
        res.on('data', chunk => {
          rawData += chunk
        })
        res.on('end', () => {
          resolve(rawData)
        })
      })
      .on('error', e => {
        reject(`Got error: ${e.message}`)
      })
  })
}

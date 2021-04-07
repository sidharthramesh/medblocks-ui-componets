export interface Ctx {
    time?: string,
    language?: string,
    territory?: string,
    composer_name?: string,
}
export interface Data { [path: string]: any }

export function defaultContextData(path: string, ctx: Ctx): any {
    const parts = path.split('/')
    const contextId = parts[parts.length - 1]
    switch (contextId) {
        case "start_time":
        case "time":
            return ctx.time || new Date().toISOString()
        case "category":
            return {
                code: '433',
                value: 'event',
                terminology: "openehr"
            }
        case "setting":
            return {
                code: "238",
                value: "other care",
                terminology: "openehr"
            }
        case "language":
            return {
                code: ctx.language || 'en',
                terminology: "ISO_639-1"
            }
        case "territory":
            return {
                code: ctx.territory || "IN",
                terminology: "ISO_3166-1"
            }

        case "encoding":
            return {
                code: "UTF-8",
                terminology: "IANA_character-sets"
            }
        case "composer":
            if (ctx.composer_name) {
                return {
                    name: ctx.composer_name,
                }
            } else {
                console.warn('Please set composer_name field on ctx property')
                return
            }
        default:
            console.warn(`[${path}]: Unprocessed context`)
            return
    }
}

export function toFlat(data: Data): Data {
    const flat: any = {}
    Object.keys(data).forEach(path => {
      if (typeof data[path] === 'object') {
        const obj = data[path]
        Object.keys(obj).forEach(frag => {
          flat[`${path}|${frag}`] = obj[frag]
        })
      }
    })
    return flat
  }

export function fromFlat(flat: Data): Data {
    let data: Data = {}
    Object.keys(flat).map(path => {
      const value = flat[path]
      const [subpath, frag] = path.split('|')
      if (frag) {
        data[subpath] = { ...data[subpath], [frag]: value }
      } else {
        data[subpath] = value
      }
    })
    return data
  }
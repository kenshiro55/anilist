import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'duration'
})
export class DurationPipe implements PipeTransform {
  private format: string = 'hh:MM:ss'
  private f = ['d', 'h', 'M', 's', 'm']

  transform(value: number, ...args: string[]): string {
    let result = ""

    if (args && args.length > 0) {
      switch (args[0]) {
        case 'm':
          value = value * 60 * 1000
          break
        case 's':
          value = value * 1000
          break
      }

      if (args.length > 1) {
        this.format = args[1]
      }
    }

    let tokens: string[] = []

    this.format.split('').forEach(c => {
      switch (c) {
        case 'd':
        case 'h':
        case 'M':
        case 's':
        case 'm':
          if (tokens.length == 0) {
            tokens.push(c)
          } else {
            let t = tokens[tokens.length - 1]
            if (t.endsWith(c)) {
              t = t + c
              tokens[tokens.length - 1] = t
            } else {
              tokens.push(c)
            }
          }
          break
        default:
          if (tokens.length == 0) {
            tokens.push(c)
          } else {
            let t = tokens[tokens.length - 1]
            let last = t[t.length - 1]
            if (this.f.indexOf(last) < 0) {
              tokens[tokens.length - 1] = t + c
            } else {
              tokens.push(c)
            }
          }
      }
    })

    let days = tokens.filter(t => t.startsWith("d")).length > 0
      ? Math.trunc(value / (24 * 60 * 60 * 1000))
      : 0
    value = value - (days * 24 * 60 * 60 * 1000)

    let hours = tokens.filter(t => t.startsWith("h")).length > 0
      ? Math.trunc(value / (60 * 60 * 1000))
      : 0
    value = value - (hours * 60 * 60 * 1000)

    let minutes = tokens.filter(t => t.startsWith("M")).length > 0
      ? Math.trunc(value / (60 * 1000))
      : 0
    value = value - (minutes * 60 * 1000)

    let seconds = tokens.filter(t => t.startsWith("s")).length > 0
      ? Math.trunc(value / 1000)
      : 0
    value = value - (seconds * 1000)

    let miliseconds = value

    tokens.forEach(t => {
      if (t.length > 0 && this.f.indexOf(t[0]) >= 0) {
        switch (t[0]) {
          case 'd':
            result += this.formatValue(days, t)
            break
          case 'h':
            result += this.formatValue(hours, t)
            break
          case 'M':
            result += this.formatValue(minutes, t)
            break
          case 's':
            result += this.formatValue(seconds, t)
            break
          case 'm':
            result += this.formatValue(miliseconds, t)
            break
          default:
            break
        }
      } else {
        result += t
      }
    })

    return result
  }

  private formatValue(value: number, format: string): string {
    let f = value + ""

    while(f.length < format.length) {
      f = '0' + f
    }

    return f
  }

}

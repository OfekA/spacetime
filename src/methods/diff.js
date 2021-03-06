const fns = require('../fns')

//init this function up here
let doAll = () => {}
let quickMonth = () => {}
//increment until dates are the same
const climb = (a, b, unit) => {
  let i = 0
  a = a.clone()
  while (a.isBefore(b)) {
    //do proper, expensive increment to catch all-the-tricks
    a = a.add(1, unit)
    i += 1
  }
  //oops, we went too-far..
  if (a.isAfter(b, unit)) {
    i -= 1
  }
  return i
}

//these small units can just be 'eyeballed'
//it's way too slow to do them procedurally
const diffQuick = (a, b) => {
  let ms = b.epoch - a.epoch
  let obj = {
    milliseconds: ms,
    seconds: parseInt(ms / 1000, 10)
  }
  obj.minutes = parseInt(obj.seconds / 60, 10)
  obj.hours = parseInt(obj.minutes / 60, 10)
  obj.days = parseInt(obj.hours / 24, 10)
  obj.weeks = parseInt(obj.days / 7, 10)
  return obj
}

const diff = (a, b, unit) => {
  //remove trailing s
  b = fns.beADate(b, a)
  if (!unit) {
    return doAll(a, b)
  }
  //make sure it's plural-form
  unit = fns.normalize(unit)
  if (/s$/.test(unit) !== true) {
    unit += 's'
  }
  //do quick-form for these small-ones
  const quick = diffQuick(a, b)
  if (unit === 'milliseconds' || unit === 'seconds' || unit === 'minutes') {
    return quick[unit]
  }
  //do the fast version for large months
  if (unit === 'months' && quick.weeks > 364) {
    return quickMonth(a, b)
  }
  //otherwise, do full-version
  if (a.isBefore(b)) {
    return climb(a, b, unit)
  } else {
    //reverse it
    return climb(b, a, unit) * -1
  }
}

//there's always 12 months in a year,
//so to speed-up a big diff, cheat this one
quickMonth = (a, b) => {
  // do all the years
  let yearDiff = b.year() - a.year()
  let months = yearDiff * 12
  //do one year
  let tmp = b.year(a.year())
  months += diff(a, tmp, 'months')
  return months
}

doAll = (a, b) => {
  //do ms, seconds, minutes in a faster way
  let all = diffQuick(a, b)
  all.years = diff(a, b, 'year')
  //do a fast-diff for days/weeks, if it's huge
  if (Math.abs(all.years) > 50) {
    all.months = quickMonth(a, b)
    return all
  }
  all.months = diff(a, b, 'month')
  all.weeks = diff(a, b, 'week')
  all.days = diff(a, b, 'day')
  //only fully-compute hours if it's a small diff
  if (all.years === 0) {
    all.hours = diff(a, b, 'hour')
  }
  return all
}
module.exports = diff

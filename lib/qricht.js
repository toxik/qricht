/* global define */
define(['lib/astro', 'lib/streams'], function (astro, streams) {
  const {
    PI,
    PS,
    STF,
    radeR,
    qqq,
    inP,
    azhude
  } = astro

  const R = 6378         /* Earth's radius */

  let OUT_EL = null
  function output (text) {
    if (OUT_EL) {
      OUT_EL.innerHTML += text + '\n'
    } else {
      console.log(text)
    }
  }

  function formatDate (date) {
    return date < 10 ? '0' + date : date
  }

  function azh (phir, labr, height, phi, lab, az, elv) {
    let dx, dy, dr

    dx = labr - lab
    if (dx > PI) dx -= 2.0 * PI
    if (dx < -PI) dx += 2.0 * PI
    dx = R * dx * Math.cos(phir)
    dy = R * (phir - phi)
    dr = Math.sqrt(dx * dx + dy * dy + height * height)
    if (dx === 0 && dy === 0) {
      az = 0.0
      elv = PI / 2.0
    } else {
      az = Math.atan2(dy, dx)           /* counter-clock with east=0 */
      az = 2.0 * PI - az              /* clockwise with east=0 */
      az = az - PI / 2.0              /* clockwise with south=0 */
      if (az < 0.0) az += 2.0 * PI
      if (az > 2.0 * PI) az -= 2.0 * PI
      elv = Math.asin(height / dr)
    }
    return [az, elv]
  }

  function dedm (x, hd, min) {
    let sign

    if (x >= 0.0) sign = +1.0
    else sign = -1.0
    hd = sign * Math.floor(sign * x)
    min = (sign * x - hd * sign) * 60.0

    return [hd, min]
  }

  function rahm (x, hd, min) {
    while (x >= 24.0) x -= 24.0
    while (x < 0.00) x += 24.0
    hd = Math.floor(x)
    min = (x - hd) * 60.0
    return [hd, min]
  }

  /*     THIS SUBROUTINE CALCULATES JULIAN DATE AND GREENWICH
  C      SIDERIAL TIME FOR THE INSTANT OF OBSERVATION FROM GIVEN
  C      DATE AND TIME (UT)
  C      INPUT PARAMETERS : IYR    = YEAR  (INT.)
  C                         IMO    = MONTH (INT.)
  C                         IDAY   = DAY   (INT.)
  C                     TH,TM,TS   = UT (HR,MIN,SEC)
  C
  C      OUTPUT PARAMETERS   JD    = JULIAN DATE
  C                          ST    = GREENWICH SID.TIME (DEC.HR.)
  C
  C      CALL SUBROUTINE   : CALL JULDATE(IYR,IMO,IDAY,TH,TM,TS,JD,ST)
  C
  C      REQUIRED SUBROUTINES    : NONE
  C

         Source: 	Ondrejov Observatory, Czech Republic
  */

  function JULDATE (IYR, IMO, IDAY, TH, TM, TS, JD, ST) {
    let IJD
    let H1, H2, H3, H4, T

    if (IMO < 2.5) {
      IYR = IYR - 1
      IMO = IMO + 12
    }
    IJD = IDAY + 2 + ((IYR / 100) / 4) - (IYR / 100)
    IJD = IJD + Math.floor(IYR * 3.6525e+2)
    IJD = IJD + Math.floor((IMO + 1) * 30.6001)
    JD = IJD + 1.7209945e6
    H1 = ((JD - 2.415020e6) / 3.6525e4)
    H1 = H1 * H1
    H1 = (H1 * 1.075e-6) + 0.276919398
    H2 = (JD - 2.415020e6) / (3.6525e4) * 1.000021359e2
    H3 = H1 + H2
    H4 = H3 - Math.floor(H3)
    T = TH + (TM / 60.0) + (TS / 3600.0)
    ST = H4 * 24 + (T * 1.0027379093)
    return [JD, ST]
  }

  /*
    this will take something like `12 34' 56"`
    and turn it into an array of numbers [ 12, 34, 56 ]
  */
  function parseCoord (strCoord) {
    return strCoord
      .replace(/'"/g, '')
      .split(' ')
      .map(c => parseInt(c, 10))
  }

  /*
    this will take something like `1996-12-10`
    and turn it into an array of numbers [ 1996, 12, 10 ]
  */
  function parseDate (strDate) {
    return strDate
      .split('-')
      .map(c => parseInt(c, 10))
  }

  function main (dS, dE, height, aimLat, aimLon, stations, outEl) {
    // store the ref to the element
    OUT_EL = outEl

    // cleanup previous results, if any
    OUT_EL.innerHTML = `\n\n<h4>RESULTS:</h4>`

    let i, j, nday, nst, day1, mon1, year1, day2, mon2, year2,
      monb, monm, mone, dayb, daym, daye,
      jdb, jde, jdm, sign, phir, labr, deg, min, sec,
      jd, jd1, jd2, gst, t, tt, tb, te, t24,
      rast, dest, drast, ddest, q, strname
    let u = []
    let de = []
    let phi = []
    let lab = []
    let az = []
    let elv = []
    let rr = []
    let ra = []
    let rah = []
    let ram = []
    let ded = []
    let dem = []
    let met1 = { rb: [], re: [] }
    let met2 = { rb: [], re: [] };

    [ year1, mon1, day1 ] = parseDate(dS);
    [ year2, mon2, day2 ] = parseDate(dE);

    [jd2, gst] = JULDATE(year2, mon2, day2, 0, 0, 0, jd2, gst);
    [jd1, gst] = JULDATE(year1, mon1, day1, 0, 0, 0, jd1, gst)

    if (jd1 > jd2) {
      output('Start date is later than end date. Please correct.')
      return
    }

    height = parseInt(height, 10)
    output(`Height of aiming point: <b>${height}</b>km\n`);

    [deg, min, sec] = parseCoord(aimLat)
    output(`Geographical latitude of <b>aiming point</b>: \t\t\t${deg}° ${min}' ${sec}"`)
    if (deg >= 0) sign = +1
    else sign = -1
    phir = PI / 180 * (deg + sign * min / 60 + sign * sec / 3600);

    [deg, min, sec] = parseCoord(aimLon)
    output(`Geographical longitude of aiming point:\t\t\t${deg}° ${min}' ${sec}"`)
    if (deg >= 0.0) sign = +1.0
    else sign = -1.0
    labr = PI / 180.0 * (deg + sign * min / 60.0 + sign * sec / 3600.0)

    let coords = []
    stations.name.forEach((n, i) => {
      coords.push({
        name: n,
        lat: parseCoord(stations.lat[i]),
        lon: parseCoord(stations.lon[i])
      })
    })

    coords.forEach((coord, i) => {
      [deg, min, sec] = coord.lat
      output(`Geographical latitude of station <b>${coord.name}</b>: \t\t${deg}° ${min}' ${sec}"`)

      if (deg >= 0) sign = +1
      else sign = -1
      phi[i] = (PI / 180) * (deg + sign * min / 60 + sign * sec / 3600);

      [deg, min, sec] = coord.lon
      output(`Geographical longitude of station ${coord.name}: \t\t${deg}° ${min}' ${sec}"`)
      if (deg >= 0.0) sign = +1.0
      else sign = -1.0
      lab[i] = PI / 180.0 * (deg + sign * min / 60.0 + sign * sec / 3600.0)
    })

    nst = coords.length

    // /* calculate azimuths and heights for all stations */
    coords.forEach((coord, i) => {
      [az[i], elv[i]] = azh(phir, labr, height, phi[i], lab[i])
      output(`\nAzimuth for station ${coord.name}: \t\t<b>${(az[i] / PS).toFixed(1)}°</b>`)
      output(`Elevation for station ${coord.name}:\t\t<b>${(elv[i] / PS).toFixed(1)}°</b>`)
    })

    /* calculate equatorial coordinates for given dates */

    for (i = 0; i < nst; i++) {
      [u[i], de[i]] = azhude(az[i], elv[i], phi[i], u[i], de[i])
      /* in uren, gecorrigeerd voor geografische lengte */
      ra[i] = -u[i] * 12 / PI + gst + lab[i] / PS / 15
      de[i] /= PS;
      [ded[i], dem[i]] = dedm(de[i], ded[i], dem[i])
    }
    jd = jd1
    nday = parseInt(jd2 - jd1 + 0.1, 10)
    tb = Math.floor(17.5 - labr * 12.0 / PI)         /* take into account time zones */
    te = Math.floor(7.5 - labr * 12.0 / PI)
    if (tb >= 24.0) tb -= 24
    if (tb < 0.0) tb += 24
    if (te >= 24.0) te -= 24
    if (te < 0.0) te += 24
    if (te > tb) nday++
    else te += 24
    if (nday === 0) nday++

    output(`\nJulian Day ${jd1.toFixed(1)} corresponds to date <b>${year1}-${mon1}-${day1}</b>`)

    let buffer = `    JD     time(UT)    `
    for (j = 0; j < nst; j++) buffer += `\tRA${j + 1}\tDE${j + 1}`

    output(`\n` + buffer)
    for (i = 0; i < nday; i++) {
      if (tb < 10.1 && tb) buffer = `${jd.toFixed(1)}   00:00:00`
      else buffer = ''
      for (t = tb; t < te; t += 1.0) {
        if (t > 23.9) t24 = t - 24
        else t24 = t
        if (Math.abs(t24) > 0.1) buffer = `           ${formatDate(t24)}:00:00`
        else buffer = `${!tb ? jd.toFixed(1) : (jd + 1).toFixed(1)}   0:00:00`
        for (j = 0; j < nst; j++) {
          [rah[j], ram[j]] = rahm(ra[j] + t * STF, rah[j], ram[j])
          buffer += `\t${rah[j].toFixed(0)} ${ram[j].toFixed(0)}\t${ded[j].toFixed(0)} ${dem[j].toFixed(0)}`
        }
        output(buffer)
      }
      jd += 1
      for (j = 0; j < nst; j++) ra[j] += 24 * (STF - 1)
    }

    /*
      Calculate angles of converence for each stream for the centre date
      of the specified period
    */
    for (j = 0; j < nst; j++) ra[j] -= nday * 12 * (STF - 1)  /* middelste dag */

    output(`\nAngles between average trails of active major streams:`)
    output(`\nStream              time(UT)`)

    for (j = 0; j < nst - 1; j++) for (i = j + 1; i < nst; i++) buffer = `\t${j + 1} - ${i + 1}`
    streams.forEach((stream) => {
      strname = stream.name;
      [[monb, dayb], [mone, daye]] = stream.period.split(' ').map(days => days.split('/').map(n => parseInt(n, 10)));
      [monm, daym] = stream.max.split('/').map(n => parseInt(n, 10));
      [rast, dest] = stream.radiant.split(' ').map(n => parseInt(n, 10));
      [drast, ddest] = stream.movement.split(' ').map(n => parseFloat(n, 10))

      if (monb > 6.0) {
        [jdb, gst] = JULDATE(year1, monb, dayb, 0.0, 0.0, 0.0, jdb, gst) /* jaarwissel */
      } else {
        [jdb, gst] = JULDATE(year2, monb, dayb, 0.0, 0.0, 0.0, jdb, gst)
      }
      if (mone > 6.0) {
        [jde, gst] = JULDATE(year1, mone, daye, 0.0, 0.0, 0.0, jde, gst)
      } else {
        [jde, gst] = JULDATE(year2, mone, daye, 0.0, 0.0, 0.0, jde, gst)
      }
      if (monm > 6.0) {
        [jdm, gst] = JULDATE(year1, monm, daym, 0.0, 0.0, 0.0, jdm, gst)
      } else {
        [jdm, gst] = JULDATE(year2, monm, daym, 0.0, 0.0, 0.0, jdm, gst)
      }

      if ((jdb > jd1 && jdb < jd2) || (jde > jd1 && jde < jd2) || (jdb < jd1 && jde > jd2)) {
        rast += drast * ((jd1 + jd2) / 2.0 - jdm)   /* radiantdrift */
        dest += ddest * ((jd1 + jd2) / 2.0 - jdm)
        met1.rb = radeR(rast * PS, dest * PS, met1.rb)
        met2.rb = radeR(rast * PS, dest * PS, met2.rb)
        rr = radeR(rast * PS, dest * PS, rr)
        output(`\n${strname}\t`)
        for (t = tb; t < te; t += 1.0) {
          if (t < 23.9) tt = t
          else tt = t - 24
          buffer = (`\t\t${formatDate(tt)}:00:00`)
          for (j = 0; j < nst - 1; j++) {
            for (i = j + 1; i < nst; i++) {
              met1.re = radeR((ra[j] + tt * STF) * PS * 15.0, de[j] * PS, met1.re)
              met2.re = radeR((ra[i] + tt * STF) * PS * 15.0, de[i] * PS, met2.re)

              q = qqq(met1, met2, rr)
              if (Math.abs(inP(rr, met1.re)) > 0.94 || Math.abs(inP(rr, met2.re)) > 0.9) q *= -1.0
              output(`${buffer}\t${(q / PS).toFixed(0)}`)
            }
          }
        }
      }
    })
    output(`\n\n\nA minus sign indicates that the angle varies strongly across the field of either station (close to radiant).`)
  }

  return {
    main
  }
})
